import { z } from "zod";

export const sendNotificationSchema = z.object({
    message: z.string().min(2).max(100),
    receiverIds: z.array(z.number()).min(1),
}).strict()

export type getNotificationType = {
    id: number;
    message: string;
    sender: {
        id: number;
        email: string;
        name: string;
    }
}