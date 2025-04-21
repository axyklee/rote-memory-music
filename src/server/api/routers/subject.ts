import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { subjectInfo } from "../schemas/subject";
import { env } from "@/env";

export const subjectRouter = createTRPCRouter({
    getProjectName: publicProcedure
        .input(z.object({
            subject: subjectInfo
        }))
        .query(async ({ ctx, input }) => {
            const { accessId, studentId } = input.subject;
            const subject = await ctx.db.subject.findFirst({
                where: {
                    project: {
                        accessId
                    },
                    studentId
                },
                select: {
                    project: {
                        select: {
                            name: true
                        }
                    }
                }
            });
            return subject?.project.name;
        }),
    getSubjectStage: publicProcedure
        .input(z.object({
            subject: subjectInfo
        }))
        .query(async ({ ctx, input }) => {
            const { accessId, studentId } = input.subject;
            const subject = await ctx.db.subject.findFirst({
                where: {
                    project: {
                        accessId
                    },
                    studentId
                },
                include: {
                    project: {
                        select: {
                            exams: {
                                select: {
                                    id: true
                                }
                            }
                        }
                    }
                }
            });
            if (!subject) throw new Error("Subject not found");
            if (subject.stage > subject.project.exams.length) {
                return -1; // subject is not in any stage
            }
            return subject?.stage;
        }),
    completeIntro: publicProcedure
        .input(z.object({
            subject: subjectInfo
        }))
        .mutation(async ({ ctx, input }) => {
            const { accessId, studentId } = input.subject;
            const subject = await ctx.db.subject.findFirst({
                where: {
                    project: {
                        accessId
                    },
                    studentId
                }
            });
            if (!subject) throw new Error("Subject not found");
            if (subject.stage !== 0) throw new Error("Subject is not in intro stage");
            await ctx.db.subject.update({
                where: {
                    id: subject.id
                },
                data: {
                    stage: 1
                }
            });
        }),
    getRandomAudioUrl: publicProcedure
        .input(z.object({
            subject: subjectInfo
        }))
        .query(async ({ ctx, input }) => {
            const { accessId, studentId } = input.subject;
            let subject = await ctx.db.subject.findFirst({
                where: {
                    project: {
                        accessId
                    },
                    studentId
                },
                select: {
                    project: {
                        select: {
                            musics: {
                                select: {
                                    name: true,
                                    url: true
                                }
                            }
                        }
                    }
                }
            });
            if (!subject) throw new Error("Subject not found");
            const musics = subject.project.musics.filter((music) => !music.name.includes("silent"));
            if (musics.length === 0) throw new Error("No music found");
            const randomIndex = Math.floor(Math.random() * musics.length);
            return await ctx.s3.presignedGetObject(env.MINIO_BUCKET, musics[randomIndex]!.url, 60 * 60 * 24) // 1 day
        }),
    getExam: publicProcedure
        .input(z.object({
            subject: subjectInfo,
            stage: z.number()
        }))
        .query(async ({ ctx, input }) => {
            const { accessId, studentId } = input.subject;
            const subject = await ctx.db.subject.findFirst({
                where: {
                    project: {
                        accessId
                    },
                    studentId
                },
                select: {
                    stage: true,
                    examIdOrder: true,
                }
            });
            if (!subject) throw new Error("Subject not found");
            if (subject.stage !== input.stage) throw new Error("Subject is not in exam stage");
            const examId = (JSON.parse(subject?.examIdOrder ?? "[]") as number[])[input.stage - 1] ?? null
            if (!examId) throw new Error("Exam not found");
            const exam = await ctx.db.exam.findFirst({
                where: {
                    id: examId
                },
                select: {
                    words: true
                }
            });
            if (!exam) throw new Error("Exam not found");
            return (JSON.parse(exam?.words ?? "[]") as string[]) ?? null;
        }),
    getMusic: publicProcedure
        .input(z.object({
            subject: subjectInfo,
            stage: z.number()
        }))
        .query(async ({ ctx, input }) => {
            const { accessId, studentId } = input.subject;
            const subject = await ctx.db.subject.findFirst({
                where: {
                    project: {
                        accessId
                    },
                    studentId
                },
                select: {
                    stage: true,
                    musicIdOrder: true,
                }
            });
            if (!subject) throw new Error("Subject not found");
            if (subject.stage !== input.stage) throw new Error("Subject is not in exam stage");
            const musicId = (JSON.parse(subject?.musicIdOrder ?? "[]") as number[])[input.stage - 1] ?? null
            if (!musicId) throw new Error("Music not found");
            const music = await ctx.db.music.findFirst({
                where: {
                    id: musicId
                },
                select: {
                    url: true
                }
            });
            return await ctx.s3.presignedGetObject(env.MINIO_BUCKET, music?.url ?? "", 60 * 60 * 24) // 1 day
        }),
    getReadingTime: publicProcedure
        .input(z.object({
            subject: subjectInfo
        }))
        .query(async ({ ctx, input }) => {
            const { accessId, studentId } = input.subject;
            const subject = await ctx.db.subject.findFirst({
                where: {
                    project: {
                        accessId
                    },
                    studentId
                },
                select: {
                    project: {
                        select: {
                            readingTime: true
                        }
                    }
                }
            });
            return subject?.project.readingTime;
        }),
    getAnswerTime: publicProcedure
        .input(z.object({
            subject: subjectInfo
        }))
        .query(async ({ ctx, input }) => {
            const { accessId, studentId } = input.subject;
            const subject = await ctx.db.subject.findFirst({
                where: {
                    project: {
                        accessId
                    },
                    studentId
                },
                select: {
                    project: {
                        select: {
                            answerTime: true
                        }
                    }
                }
            });
            return subject?.project.answerTime;
        }),
    submitAnswers: publicProcedure
        .input(z.object({
            subject: subjectInfo,
            stage: z.number(),
            answers: z.array(z.string())
        }))
        .mutation(async ({ ctx, input }) => {
            // get correct answers
            const { accessId, studentId } = input.subject;
            const subject = await ctx.db.subject.findFirst({
                where: {
                    project: {
                        accessId
                    },
                    studentId
                },
                select: {
                    id: true,
                    projectId: true,
                    examIdOrder: true,
                    musicIdOrder: true,
                    stage: true
                }
            });
            if (!subject) throw new Error("Subject not found");
            if (subject.stage !== input.stage) throw new Error("Subject is not in exam stage");
            const examId = (JSON.parse(subject?.examIdOrder ?? "[]") as number[])[input.stage - 1] ?? null
            const musicId = (JSON.parse(subject?.musicIdOrder ?? "[]") as number[])[input.stage - 1] ?? null
            if (!examId) throw new Error("Exam not found");
            if (!musicId) throw new Error("Music not found");
            const exam = await ctx.db.exam.findFirst({
                where: {
                    id: examId
                },
                select: {
                    words: true
                }
            });
            if (!exam) throw new Error("Exam not found");
            const correctAnswers = (JSON.parse(exam?.words ?? "[]") as string[]) ?? null;
            // calculate score is the number of correct answers
            let score = 0;
            correctAnswers.forEach((answer) => {
                if (input.answers.includes(answer)) {
                    score++;
                }
            });
            // update subject
            await ctx.db.result.create({
                data: {
                    subjectId: subject.id,
                    projectId: subject.projectId,
                    examId: examId,
                    musicId: musicId,
                    score: Number.isNaN(score / correctAnswers.length) ? 0 : (score / correctAnswers.length),
                    response: JSON.stringify(input.answers),
                }
            })
            // update stage
            const nextStage = input.stage + 1;
            await ctx.db.subject.update({
                where: {
                    id: subject.id
                },
                data: {
                    stage: nextStage,
                }
            })
        })
})