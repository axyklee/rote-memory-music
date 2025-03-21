import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure
} from "@/server/api/trpc";
import { createProjectSchema, projectGeneralTabSchema } from "../schemas/admin";

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
        orderBy: {
          createdAt: "desc"
        },
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
  setProjectGeneralTab: protectedProcedure
    .input(projectGeneralTabSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.update({
        where: {
          accessId: input.accessId
        },
        data: {
          name: input.name,
          accessId: input.accessId,
          enabled: input.enabled
        }
      })
    }),
  // getLatest: protectedProcedure.query(async ({ ctx }) => {
  //   const post = await ctx.db.post.findFirst({
  //     orderBy: { createdAt: "desc" },
  //     where: { createdBy: { id: ctx.session.user.id } },
  //   });

  //   return post ?? null;
  // }),

  // getSecretMessage: protectedProcedure.query(() => {
  //   return "you can now see this secret message!";
  // }),
});
