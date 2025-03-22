import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure
} from "@/server/api/trpc";
import { createProjectSchema, projectExamsTabSchema, projectGeneralTabSchema, projectMusicTabSchema } from "../schemas/admin";
import { env } from "@/env";

export const adminRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return ctx.db.project.create({
          data: {
            name: input.name,
            accessId: Math.random().toString(10).substring(2, 7),
            enabled: false,
            createdById: ctx.session.user.id
          }
        })
      } catch (error) {
        console.error(error);
        return null;
      }
    }),
  getProjects: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.project.findMany({
        where: {
          createdById: ctx.session.user.id
        },
        orderBy: [
          { enabled: "desc" }, // Sort by enabled first
          { createdAt: "desc" }
        ],
        select: {
          name: true,
          accessId: true,
          enabled: true,
        }
      })
    }),
  getProject: protectedProcedure
    .input(z.string().regex(/^\d{5}$/))
    .query(async ({ ctx, input }) => {
      return ctx.db.project.findFirst({
        where: {
          accessId: input
        }
      })
    }),

  // General Tab
  setProjectGeneralTab: protectedProcedure
    .input(projectGeneralTabSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.update({
        where: {
          accessId: input.origAccessId
        },
        data: {
          name: input.name,
          accessId: input.accessId,
          enabled: input.enabled
        }
      })
    }),

  // Exams Tab
  getExams: protectedProcedure
    .input(z.string().regex(/^\d{5}$/))
    .query(async ({ ctx, input }) => {
      return ctx.db.exam.findMany({
        where: {
          project: {
            accessId: input
          }
        },
        select: {
          id: true,
          name: true,
          words: true,
          readingTime: true
        }
      })
    }),
  createExam: protectedProcedure
    .input(projectExamsTabSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.exam.create({
        data: {
          project: {
            connect: {
              accessId: input.accessId
            }
          },
          name: input.name,
          words: input.wordList as string,
          readingTime: input.readingTime
        }
      })
    }),
  deleteExam: protectedProcedure
    .input(z.number().int())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.exam.delete({
        where: {
          id: input
        }
      })
    }),

  // Music Tab
  getMusic: protectedProcedure
    .input(z.string().regex(/^\d{5}$/))
    .query(async ({ ctx, input }) => {
      const musicList = await ctx.db.music.findMany({
        where: {
          project: {
            accessId: input
          }
        },
        select: {
          id: true,
          name: true,
          url: true
        }
      })
      // for each url, get the presigned url
      return Promise.all(musicList.map(async (music) => {
        music.url = await ctx.s3.presignedGetObject(env.MINIO_BUCKET, music.url, 60 * 60 * 24) // 1 day
        return music;
      }));
    }),
  deleteMusic: protectedProcedure
    .input(z.number().int())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.music.delete({
        where: {
          id: input
        }
      }).then((music) => {
        ctx.s3.removeObject(env.MINIO_BUCKET, music.url);
        return music;
      });
    }),
  getMusicUploadUrl: protectedProcedure
    .query(async ({ ctx }) => {
      const path = "music/" + Math.random().toString(10).substring(2, 13);
      return {
        path: path,
        url: await ctx.s3.presignedPutObject(env.MINIO_BUCKET, path, 60 * 60) // 1 hour
      }
    }),
  createMusic: protectedProcedure
    .input(projectMusicTabSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.music.create({
        data: {
          project: {
            connect: {
              accessId: input.accessId
            }
          },
          name: input.name,
          url: input.path
        }
      })
    }),
});
