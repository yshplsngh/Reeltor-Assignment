import express, { Request, Response, NextFunction, CookieOptions } from "express";
import bcrypt from "bcrypt";
import prisma from "../database";
import { loginSchema, registerSchema } from "../types/authTypes";
import { createError } from "../utils/middleware/errorHandler";
import { config } from "../utils/config";
import { signJWT } from "../utils/jwt";

const router = express.Router();


export const tokenCookieOptions: CookieOptions = {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: false,
    sameSite: "lax",
}

/**
 * @description User registration
 * @route POST /api/v1/auth/register
 * @param {string} name - The name of the user
 * @param {number} contact - The contact number of the user
 * @param {string} bio - The bio of the user
 * @param {string} email - The email of the user
 * @param {string} password - The password of the user
 * @param {string[]} availabilityTime - The availability time eg. ["09:00-17:00","10:00-18:00"]
 * @example {
    "name":"Yashpal Singh",
    "contact":"8439345464",
    "bio":"be nice to everyone",
    "email":"yashpal9rx@gmail.com",
    "password":"pass9rx",
    "availabilityTime":["06:00-10:00","14:00-23:00"]
    }
* @returns {"message": "User created successfully"}
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    const isValid = registerSchema.safeParse(req.body);
    if (!isValid.success) {
        next(isValid.error);
        return;
    }
    const userFound = await prisma.user.findUnique({
        where: {
            email: isValid.data.email
        }
    })
    if (userFound) {
        next(new createError("User already exists", 400));
        return;
    }
    const hashedPassword = await bcrypt.hash(isValid.data.password, 10);
    await prisma.user.create({
        data: {
            name: isValid.data.name,
            contact: isValid.data.contact,
            bio: isValid.data.bio,
            email: isValid.data.email,
            password: hashedPassword,
            availabilityTime: isValid.data.availabilityTime,
        }
    })
    res.status(201).json({
        message: "User created successfully",
    })
})

/**
 * @description User login
 * @route POST /api/v1/auth/login
 * @param {string} email - The email of the user
 * @param {string} password - The password of the user
 * 
 * @example {
    "email":"yashpal9rx@gmail.com",
    "password":"pass9rx"
    }
 * @returns {"message": "User logged in successfully"}
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    const isValid = loginSchema.safeParse(req.body);
    if (!isValid.success) {
        next(isValid.error);
        return;
    }
    const userFound = await prisma.user.findUnique({
        where: {
            email: isValid.data.email
        }
    })
    if (!userFound) {
        next(new createError("Invalid credentials", 404));
        return;
    }
    const matchPassword = bcrypt.compare(isValid.data.password, userFound.password);
    if (!matchPassword) {
        next(new createError("Invalid credentials", 400));
        return;
    }
    const user = { id: userFound.id, role: userFound.role };
    const accessToken = signJWT(user, { expiresIn: config.ATTL });
    const refreshToken = signJWT(user, { expiresIn: config.RFTL });

    res.cookie("accessToken", accessToken, tokenCookieOptions);
    res.cookie("refreshToken", refreshToken, tokenCookieOptions);

    res.status(200).json({
        message: "User logged in successfully",
    })
})

export default router;