import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure
} from "@/server/api/trpc";
import { createProjectSchema, projectAccessId, projectExamsTabSchema, projectGeneralTabSchema, projectMusicTabSchema, projectSubjectsTabMassSchema, projectSubjectsTabSchema } from "../schemas/admin";
import { env } from "@/env";
import { factorial, nextPermutation } from "@/lib/utils";
import { type User } from "next-auth";
import { type PrismaClient } from "@prisma/client";
import { type DefaultArgs } from "@prisma/client/runtime/library";
import { type Client } from "minio";

const failIfProjectEnabled = async (ctx: {
  session: {
    user: {
      id: string;
    } & User;
    expires: string;
  };
  headers: Headers;
  db: PrismaClient<{
    log: ("query" | "warn" | "error")[];
  }, never, DefaultArgs>;
  s3: Client;
}, accessId: string) => {
  const project = await ctx.db.project.findFirst({
    where: {
      accessId: accessId
    }
  });
  if (!project) {
    throw new Error("Project not found");
  }
  if (project.enabled) {
    throw new Error("Project is enabled. You cannot modify it. Please disable it first.");
  }
  return project;
}

export const adminRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.create({
        data: {
          name: input.name,
          accessId: Math.random().toString(10).substring(2, 7),
          enabled: false,
          createdById: ctx.session.user.id
        }
      })
    }),
  getProjects: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.project.findMany({
        orderBy: [
          { enabled: "desc" }, // Sort by enabled first
          { createdAt: "desc" }
        ],
        select: {
          name: true,
          accessId: true,
          enabled: true,
          ready: true,
          musics: {
            select: {
              id: true
            }
          },
          exams: {
            select: {
              id: true
            }
          },
          subjects: {
            select: {
              id: true
            }
          },
          results: {
            select: {
              id: true
            }
          }
        }
      })
    }),
  getProject: protectedProcedure
    .input(projectAccessId)
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
      const project = await ctx.db.project.findFirst({
        where: {
          accessId: input.origAccessId
        }
      });
      if (!project) {
        throw new Error("Project not found");
      }
      if (input.enabled && !project.ready) {
        throw new Error("Project is not ready. Please generate subject lists from the Subjects tab.");
      }
      return await ctx.db.project.update({
        where: {
          accessId: input.origAccessId
        },
        data: {
          name: input.name,
          accessId: input.accessId,
          readingTime: input.readingTime,
          answerTime: input.answerTime,
          enabled: input.enabled
        }
      })
    }),

  // Exams Tab
  getExams: protectedProcedure
    .input(projectAccessId)
    .query(async ({ ctx, input }) => {
      return await ctx.db.exam.findMany({
        where: {
          project: {
            accessId: input
          }
        },
        select: {
          id: true,
          name: true,
          words: true
        }
      })
    }),
  createExam: protectedProcedure
    .input(projectExamsTabSchema)
    .mutation(async ({ ctx, input }) => {
      await failIfProjectEnabled(ctx, input.accessId);

      return await ctx.db.exam.create({
        data: {
          project: {
            connect: {
              accessId: input.accessId
            }
          },
          name: input.name,
          words: input.wordList
        }
      }).then(async (exam) => {
        await ctx.db.project.update({
          where: {
            id: exam.projectId
          },
          data: {
            ready: false
          }
        });
        return exam;
      })
    }),
  deleteExam: protectedProcedure
    .input(z.number().int())
    .mutation(async ({ ctx, input }) => {
      const exam = await ctx.db.exam.findFirst({
        where: {
          id: input
        },
        select: {
          project: {
            select: {
              accessId: true
            }
          }
        }
      });
      await failIfProjectEnabled(ctx, exam?.project.accessId ?? "");

      return await ctx.db.exam.delete({
        where: {
          id: input
        }
      }).then(async (exam) => {
        await ctx.db.project.update({
          where: {
            id: exam.projectId
          },
          data: {
            ready: false
          }
        });
        return exam;
      })
    }),

  // Music Tab
  getMusic: protectedProcedure
    .input(projectAccessId)
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
      const music = await ctx.db.music.findFirst({
        where: {
          id: input
        },
        select: {
          project: {
            select: {
              accessId: true
            }
          }
        }
      });
      await failIfProjectEnabled(ctx, music?.project.accessId ?? "");

      return await ctx.db.music.delete({
        where: {
          id: input
        }
      }).then(async (music) => {
        await ctx.s3.removeObject(env.MINIO_BUCKET, music.url);
        await ctx.db.project.update({
          where: {
            id: music.projectId
          },
          data: {
            ready: false
          }
        });
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
      await failIfProjectEnabled(ctx, input.accessId);

      return await ctx.db.music.create({
        data: {
          project: {
            connect: {
              accessId: input.accessId
            }
          },
          name: input.name,
          url: input.path
        }
      }).then(async (music) => {
        await ctx.db.project.update({
          where: {
            id: music.projectId
          },
          data: {
            ready: false
          }
        });
        return music;
      })
    }),

  // Subjects Tab
  getSubjects: protectedProcedure
    .input(projectAccessId)
    .query(async ({ ctx, input }) => {
      return await ctx.db.subject.findMany({
        where: {
          project: {
            accessId: input
          }
        },
        include: {
          result: {
            select: {
              id: true
            }
          }
        },
        orderBy: {
          studentId: "asc"
        }
      }).then(async (subjects) => {
        return await Promise.all(subjects.map(async (subject) => {
          const musicIds = JSON.parse(subject.musicIdOrder) as number[];
          const examIds = JSON.parse(subject.examIdOrder) as number[];

          return {
            ...subject,
            music: await Promise.all(musicIds.map(async (musicId) => {
              return await ctx.db.music.findFirst({
                where: {
                  id: musicId
                },
                select: {
                  name: true
                }
              }).then((music) => music?.name)
            })),
            exam: await Promise.all(examIds.map(async (examId) => {
              return await ctx.db.exam.findFirst({
                where: {
                  id: examId
                },
                select: {
                  name: true
                }
              }).then((exam) => exam?.name)
            }))
          }
        }))
      })
    }),
  deleteSubject: protectedProcedure
    .input(z.number().int())
    .mutation(async ({ ctx, input }) => {
      const subject = await ctx.db.subject.findFirst({
        where: {
          id: input
        },
        select: {
          project: {
            select: {
              accessId: true
            }
          }
        }
      });
      await failIfProjectEnabled(ctx, subject?.project.accessId ?? "");

      return await ctx.db.subject.delete({
        where: {
          id: input,
        }
      }).then(async (subject) => {
        await ctx.db.project.update({
          where: {
            id: subject.projectId
          },
          data: {
            ready: false
          }
        });
        return subject;
      });
    }),
  generateSubjectOrders: protectedProcedure
    .input(projectAccessId)
    .mutation(async ({ ctx, input }) => {
      await failIfProjectEnabled(ctx, input);

      const exams = await ctx.db.exam.findMany({
        where: {
          project: {
            accessId: input
          }
        },
        select: {
          id: true
        }
      }).then((e) => e.map((e) => e.id));
      let music = await ctx.db.music.findMany({
        where: {
          project: {
            accessId: input
          }
        },
        select: {
          id: true
        }
      }).then((e) => e.map((e) => e.id));
      const subjects = await ctx.db.subject.findMany({
        where: {
          project: {
            accessId: input
          }
        },
        select: {
          id: true
        }
      }).then((e) => e.map((e) => e.id));;

      if (exams.length !== music.length) {
        throw new Error(`Number of exams (${exams.length}) and music (${music.length}) must be equal`);
      }
      if (subjects.length < factorial(music.length)) {
        throw new Error(`Not enough subjects to test all permutations (${music.length}! = ${factorial(music.length)})`);
      }

      // randomize subjects array
      subjects.sort(() => Math.random() - 0.5);

      // sort music array for nextPermutation
      music.sort((a, b) => a - b);
      const firstPerm = music.slice();

      return await Promise.all(subjects.map(async (subject) => {
        // randomize exams
        exams.sort(() => Math.random() - 0.5);
        const nextPerm = nextPermutation(music.slice());
        if (nextPerm.join(",") === firstPerm.join(",")) {
          // if nextPerm is the same as firstPerm, then we have reached the end of the permutations
          // so we reset the music array to the first permutation
          music = firstPerm;
        } else {
          music = nextPerm;
        }

        return await ctx.db.subject.update({
          where: {
            id: subject
          },
          data: {
            examIdOrder: JSON.stringify(exams),
            musicIdOrder: JSON.stringify(music)
          }
        });
      })).then(async (subjects) => {
        await ctx.db.project.update({
          where: {
            accessId: input
          },
          data: {
            ready: true
          }
        });
        return subjects;
      })
    }),
  createSubject: protectedProcedure
    .input(projectSubjectsTabSchema)
    .mutation(async ({ ctx, input }) => {
      await failIfProjectEnabled(ctx, input.accessId);

      const existingSubject = await ctx.db.subject.findFirst({
        where: {
          studentId: input.studentId,
          project: {
            accessId: input.accessId
          }
        }
      });
      if (existingSubject) {
        throw new Error("Student ID already exists");
      }

      return await ctx.db.subject.create({
        data: {
          project: {
            connect: {
              accessId: input.accessId
            }
          },
          studentId: input.studentId,
          name: input.name,
          musicIdOrder: "[]",
          examIdOrder: "[]"
        }
      }).then(async (subject) => {
        await ctx.db.project.update({
          where: {
            id: subject.projectId
          },
          data: {
            ready: false
          }
        });
        return subject;
      })
    }),
  massCreateSubject: protectedProcedure
    .input(projectSubjectsTabMassSchema)
    .mutation(async ({ ctx, input }) => {
      await failIfProjectEnabled(ctx, input.accessId);

      const studentIdList = input.studentIdList.split("\n").map((studentId) => parseInt(studentId));
      return await Promise.all(studentIdList.map(async (studentId) => {
        const existingSubject = await ctx.db.subject.findFirst({
          where: {
            studentId: studentId,
            project: {
              accessId: input.accessId
            }
          }
        });
        if (existingSubject) {
          throw new Error(`Student ID ${studentId} already exists`);
        }

        return await ctx.db.subject.create({
          data: {
            project: {
              connect: {
                accessId: input.accessId
              }
            },
            studentId: studentId,
            musicIdOrder: "[]",
            examIdOrder: "[]"
          }
        });
      })).then(async (subjects) => {
        await ctx.db.project.update({
          where: {
            id: subjects[0]!.projectId
          },
          data: {
            ready: false
          }
        });
        return subjects;
      });
    }),
  resetSubject: protectedProcedure
    .input(z.number().int())
    .mutation(async ({ ctx, input }) => {
      const subject = await ctx.db.subject.findFirst({
        where: {
          id: input
        }
      });
      if (!subject) {
        throw new Error("Subject not found");
      }
      await ctx.db.result.deleteMany({
        where: {
          subjectId: subject.id
        }
      });
      return await ctx.db.subject.update({
        where: {
          id: subject.id
        },
        data: {
          stage: 0,
        }
      });
    }),

  // Results Tab
  getResults: protectedProcedure
    .input(projectAccessId)
    .query(async ({ ctx, input }) => {
      const results = await ctx.db.result.findMany({
        where: {
          subject: {
            project: {
              accessId: input
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });
      // replace musicId with music name, examId with exam name
      return await Promise.all(results.map(async (result) => {
        return {
          ...result,
          subjectStudentId: await ctx.db.subject.findFirst({
            where: {
              id: result.subjectId
            },
            select: {
              studentId: true
            }
          }).then((subject) => subject?.studentId),
          music: await ctx.db.music.findFirst({
            where: {
              id: result.musicId
            },
            select: {
              name: true
            }
          }).then((music) => music?.name),
          exam: await ctx.db.exam.findFirst({
            where: {
              id: result.examId
            },
            select: {
              name: true
            }
          }).then((exam) => exam?.name),
        }
      }));
    }),
  deleteResult: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.result.delete({
        where: {
          id: input
        }
      });
    }),
  downloadResultsCsv: protectedProcedure
    .input(projectAccessId)
    .query(async ({ ctx, input }) => {
      const results = await ctx.db.result.findMany({
        where: {
          subject: {
            project: {
              accessId: input
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });
      const finalResults = await Promise.all(results.map(async (result) => {
        return {
          ...result,
          subjectStudentId: await ctx.db.subject.findFirst({
            where: {
              id: result.subjectId
            },
            select: {
              studentId: true
            }
          }).then((subject) => subject?.studentId),
          music: await ctx.db.music.findFirst({
            where: {
              id: result.musicId
            },
            select: {
              name: true
            }
          }).then((music) => music?.name),
          exam: await ctx.db.exam.findFirst({
            where: {
              id: result.examId
            },
            select: {
              name: true
            }
          }).then((exam) => exam?.name),
        }
      }));
      const csvHeader = [
        "Student ID",
        "Music",
        "Exam",
        "Score",
        "Response"
      ];
      const csvRows = finalResults.map((result) => [
        result.subjectStudentId,
        result.music,
        result.exam,
        result.score,
        result.response
      ]);
      const csvContent = [
        csvHeader,
        ...csvRows
      ].map(e => e.join(",")).join("\n");
      return new Blob([csvContent], { type: 'text/csv' }).text().then((text) => {
        return text;
      });
    }),
  recalculateResults: protectedProcedure
    .input(projectAccessId)
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: {
          accessId: input
        },
        select: {
          results: {
            select: {
              id: true,
              exam: {
                select: {
                  words: true
                }
              },
              response: true,
            }
          }
        }
      });
      if (!project) {
        throw new Error("Project not found");
      }
      if (project.results.length === 0) {
        throw new Error("No results found");
      }
      await Promise.all(project.results.map(async (result) => {
        const correctAnswers = (JSON.parse(result.exam.words ?? "[]") as string[]) ?? null;

        let score = 0;
        const response: string[] = [];
        (JSON.parse(result.response ?? "[]") as string[] ?? null).forEach((resp) => {
          if (resp.includes(",")) {
            response.push(...resp.split(",").map((r) => r.trim().toLowerCase()));
          } if (resp.trim().includes(" ")) {
            response.push(...resp.trim().split(" ").map((r) => r.trim().toLowerCase()));
          } if (resp.trim().includes("+")) {
            response.push(...resp.trim().split("+").map((r) => r.trim().toLowerCase()));
          } else {
            response.push(resp.trim().toLowerCase());
          }
        });
        correctAnswers.forEach((answer) => {
          if (response.includes(answer)) {
            score++;
          }
        });
        await ctx.db.result.update({
          where: {
            id: result.id
          },
          data: {
            score: Number.isNaN(score / correctAnswers.length) ? 0 : (score / correctAnswers.length),
          }
        });
      }));
      return {
        message: "Results recalculated successfully"
      }
    })
});
