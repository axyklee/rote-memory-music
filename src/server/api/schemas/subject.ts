import { z } from "zod";

export const subjectInfo = z.object({
    accessId: z.string(),
    studentId: z.number(),
})