import { z } from "zod";

export const createProjectSchema = z.object({
    name: z.string(),
})

export const projectGeneralTabSchema = z.object({
    name: z.string(),
    accessId: z.string().regex(/^\d{5}$/),
    enabled: z.boolean(),
})