import { z } from "zod";

export const createProjectSchema = z.object({
    name: z.string(),
})

export const projectGeneralTabSchema = z.object({
    name: z.string(),
    origAccessId: z.string().regex(/^\d{5}$/),
    accessId: z.string().regex(/^\d{5}$/),
    enabled: z.boolean(),
})

export const projectMusicTabSchema = z.object({
    accessId: z.string().regex(/^\d{5}$/),
    name: z.string().min(1),
    path: z.string().min(1, "Please upload a file first"),
})

export const projectExamsTabSchema = z.object({
    accessId: z.string().regex(/^\d{5}$/),
    name: z.string().min(1),
    wordList: z.string()
        .superRefine((value, ctx) => {
            try {
                const parsed = JSON.parse(value);
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
        }).transform((value) => JSON.parse(value)).transform((value) => JSON.stringify(value)),
    readingTime: z.coerce.number().int().min(1),
})