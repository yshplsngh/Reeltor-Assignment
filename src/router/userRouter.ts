import express, { Request, Response, NextFunction } from 'express'
import { userUpdateSchema } from '../types/userTypes';
import prisma from '../database';
import { createError } from '../utils/middleware/errorHandler';

const router = express.Router();


/**
 * @description Update user profile
 * @route PUT /api/v1/user/profile
 * @param {string} name - The name of the user
 * @param {string} contact - The contact number of the user
 * @param {string} bio - The bio of the user
 * @param {string[]} availabilityTime - The availability time eg. ["09:00-17:00","10:00-18:00"]
 * @note All fields are optional, but at least one field is required
 * 
 * @example 
 * {
	"name":"updated name",
	"bio":"updated bio"
    }
 * @returns {
	"message": "User updated successfully",
	"user": {
		"id": 12,
		"name": "updated name",
		"contact": "8439345464",
		"bio": "updated bio",
		"email": "yashpal9rx@gmail.com",
		"password": "$2b$10$riAFTkd6EtMnOH4EzUEwrehxCoPdJZc5Qe1nATn7cbopu7gKqmO3K",
		"availabilityTime": [
			"06:00-10:00",
			"14:00-23:00"
		],
		"role": "USER",
		"createdAt": "2025-02-02T18:13:55.268Z"
	}
}
 */
router.put('/profile', async(req: Request, res: Response, next: NextFunction) => {
    const isValid = userUpdateSchema.safeParse(req.body);
    if(!isValid.success){
        next(isValid.error);
        return;
    }

    const userExists = await prisma.user.findUnique({
        where:{
            id: res.locals.user.id
        }
    })
    if(!userExists){
        next(new createError("User not found", 404));
        return;
    }
    const updatedUser = await prisma.user.update({
        where:{
            id : userExists.id,
        },
        data:isValid.data
    })

    res.status(200).json({
        message: "User updated successfully",
        user: updatedUser,
    })
})

export default router;