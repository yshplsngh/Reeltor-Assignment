import express, { Request, Response, NextFunction } from "express";
import { sendNotificationSchema } from "../types/notificationTypes";
import prisma from '../database'
import { getNotificationType } from "../types/notificationTypes";
const router = express.Router()


/**
 * @description Send notification to one or more users
 * @route POST /api/v1/user/notification
 * @param {string} message - The message to be sent
 * @param {string[]} receiverIds - The ids of the users to be notified
 */
router.post('/send', async (req: Request, res: Response, next: NextFunction) => {
    const isValid = sendNotificationSchema.safeParse(req.body)
    if (!isValid.success) {
        next(isValid.error)
        return;
    }

    await prisma.notification.create({
        data: {
            message: isValid.data.message,
            senderId: res.locals.user.id,
            receivers: {
                connect: isValid.data.receiverIds.map((id) => ({ id }))
            }
        }
    })

    res.status(201).json({
        message: 'Notification sent successfully'
    })
})

/**
 * @description Fetch notifications when user is logged in
 * @route GET /api/v1/notification/get
 * @returns {getNotificationType[]}
 */
router.get('/get', async (req: Request, res: Response, next: NextFunction) => {
    const notifications = await prisma.user.findUnique({
        where: { id: res.locals.user.id },
        select: {
            receivedNotifications: {
                select: {
                    id: true,
                    message: true,
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    })

    res.status(200).json({
        notifications: notifications?.receivedNotifications
    })
})


export default router;