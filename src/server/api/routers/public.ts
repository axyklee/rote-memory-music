import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const publicRouter = createTRPCRouter({
    projectExistence: publicProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            try {
                await ctx.db.project.findFirstOrThrow({ where: { accessId: input } })
                return true
            } catch (error) {
                if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
                    return false
                }
                throw error
            }
        }),
    subjectExistence: publicProcedure
        .input(z.object({
            accessId: z.string(),
            studentId: z.number()
        }))
        .query(async ({ ctx, input }) => {
            try {
                await ctx.db.subject.findFirstOrThrow({
                    where: {
                        project: {
                            accessId: input.accessId
                        },
                        studentId: input.studentId
                    }
                })
                return true
            } catch (error) {
                if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
                    return false
                }
                throw error
            }
        })
})