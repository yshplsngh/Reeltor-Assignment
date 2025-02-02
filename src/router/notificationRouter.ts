import express, { Request, Response, NextFunction } from "express";
import { sendNotificationSchema } from "../types/notificationTypes";
import prisma from '../database'
import { getNotificationType } from "../types/notificationTypes";
import { createError } from "../utils/middleware/errorHandler";
import { NotificationType } from "@prisma/client";
const router = express.Router()


/**
 * @description Send notification to one or more users
 * @route POST /api/v1/user/notification
 * @param {string} message - The message to be sent
 * @param {string[]} receiverIds - The ids of the users to be sent notification
 * @returns {string} 
 */
router.post('/send', async (req: Request, res: Response, next: NextFunction) => {
    const isValid = sendNotificationSchema.safeParse(req.body)
    if (!isValid.success) {
        next(isValid.error)
        return;
    }

    const recipients = await prisma.user.findMany({
        where: {
            id: {
                in: isValid.data.receiverIds
            }
        }
    });


    if (recipients.length !== isValid.data.receiverIds.length) {
        next(new createError('One or more recipients not found', 404));
        return;
    }

    // it will stop user from sending notification to himself
    if (isValid.data.receiverIds.includes(res.locals.user.id)) {
        next(new createError('You cannot send notification to yourself', 400))
        return;
    }

    await prisma.notification.create({
        data: {
            message: isValid.data.message,
            senderId: res.locals.user.id,
            messageType: isValid.data.messageType,
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
 * @description Fetch notifications on starting of the website, only if user is logged, current time is in user's availability time
 * @route GET /api/v1/notification/get
 * @returns {getNotificationType[]}
 */
router.get('/get', async (req: Request, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
        where: { id: res.locals.user.id },
        select: {
            availabilityTime: true
        }
    })

    if (!user) {
        next(new createError('User not found', 404))
        return;
    }

    //check if user is available now
    const isAvailableNow = checkAvailability(user.availabilityTime)

    const notifications = await prisma.user.findUnique({
        where: { id: res.locals.user.id },
        select: {
            receivedNotifications: {
                select: {
                    id: true,
                    message: true,
                    messageType: true,
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
    // if user has no notifications, return empty array
    if(!notifications){
        res.status(200).json({
            notifications: []
        })
        return;
    }
    // filter all critical notifications;
    const criticalNotifications = notifications.receivedNotifications
        .filter(notification => notification.messageType === NotificationType.CRITICAL)


    // if user has critical notifications, and he is not available now, return critical notifications
    if(criticalNotifications.length>0 && !isAvailableNow){
        res.status(200).json({
            notifications: criticalNotifications
        })
        return;
    }
    // if user has no critical notifications, and he is not available now, return empty array
    else if(criticalNotifications.length ===0 && !isAvailableNow){
        res.status(200).json({
            notifications: []
        })
        return;
    }
    // if user has no critical notifications, and he is available now, return all notifications
    else if(criticalNotifications.length === 0 && isAvailableNow){
        res.status(200).json({
            notifications: notifications.receivedNotifications
        })
        return;
    }
    // if user has no critical notifications, and he is not available now, return empty array
    res.status(200).json({
        notifications: []
    })
})

const checkAvailability = (availabilityTime: string[]) => {
    const now = new Date()
    const currentTime = `${now.getHours()}:${now.getMinutes()}`
    return availabilityTime.some(slot => {
        const [start, end] = slot.split('-')
        if (!start || !end) return false
        return currentTime >= start && currentTime <= end
    })
}

export default router;