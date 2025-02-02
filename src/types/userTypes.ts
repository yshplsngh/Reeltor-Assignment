import { strict } from "assert";
import z from "zod";

export const userUpdateSchema = z.object({
    name: z.string().min(2).max(20).optional(),
    contact: z.string().length(10).optional(),
    bio: z.string().min(2).max(100).optional(),
    availabilityTime: z.array(z.string().min(1).max(20)).min(1).max(7).optional(),
}).strict()
    .refine((data) => Object.keys(data).length > 0, { message: "At least one field is required for update" })