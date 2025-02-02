import { z } from "zod";

export enum NotificationType {
    CRITICAL = "CRITICAL",
    NORMAL = "NORMAL"
}

export const sendNotificationSchema = z.object({
    message: z.string().min(2).max(100),
    receiverIds: z.array(z.number()).min(1),
    messageType: z.nativeEnum(NotificationType)
}).strict()



export type getNotificationType = {
    id: number;
    message: string;
    messageType: NotificationType;
    sender: {
        id: number;
        email: string;
        name: string;
    }
}