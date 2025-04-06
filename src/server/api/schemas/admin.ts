import { z } from "zod";

export const projectAccessId = z.string().regex(/^\d{5}$/)

export const createProjectSchema = z.object({
    name: z.string(),
})

export const projectGeneralTabSchema = z.object({
    name: z.string(),
    origAccessId: projectAccessId,
    accessId: projectAccessId,
    readingTime: z.coerce.number(),
    answerTime: z.coerce.number(),
    enabled: z.boolean(),
})

export const projectMusicTabSchema = z.object({
    accessId: projectAccessId,
    name: z.string().min(1),
    path: z.string().min(1, "Please upload a file first"),
})

export const projectExamsTabSchema = z.object({
    accessId: projectAccessId,
    name: z.string().min(1),
    wordList: z.string()
        .superRefine((value, ctx) => {
            try {
                const parsed = JSON.parse(value) as string[] | null;
                if (!Array.isArray(parsed)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Word List must be a JSON array",
                    });
                    return;
                }
                if (!parsed.every((item) => typeof item === "string")) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Word List must contain only strings",
                    });
                }
                if (parsed.length === 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "You must have at least one word",
                    });
                }
            } catch {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Invalid JSON format",
                });
            }
        }).transform((value) => JSON.stringify(JSON.parse(value)))
})

export const projectSubjectsTabSchema = z.object({
    accessId: projectAccessId,
    studentId: z.coerce.number().gte(10000000, "Student ID must be 8 digits.").lte(99999999, "Student ID must be 8 digits."),
    name: z.string().optional(),
})

export const projectSubjectsTabMassSchema = z.object({
    accessId: projectAccessId,
    studentIdList: z.string().superRefine((value, ctx) => {
        const valueArr = value.split("\n").map((item) => item.trim())
        if (valueArr.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "You must have at least one student ID",
            });
        }
        if (!valueArr.every((item) => /^\d{8}$/.test(item))) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Student IDs must be 8 digits",
            });
        }
        // no duplicates
        if (new Set(valueArr).size !== valueArr.length) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Student IDs must be unique",
            });
        }
    })
})