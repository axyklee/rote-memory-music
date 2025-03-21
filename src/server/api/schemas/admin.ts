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