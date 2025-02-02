import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(2).max(20),
    contact: z.string().length(10),
    bio: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(2).max(25),
    availabilityTime: z.array(z.string().min(5).max(20)).length(5),
}).strict()

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(2).max(25),
}).strict()