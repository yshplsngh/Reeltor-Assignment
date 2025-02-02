import prisma from "../database";
import { config } from "./config";
import jwt from "jsonwebtoken";

interface JWTPayload {
    id: number;
    role: string;
    iat: number;  // issued at timestamp
    exp: number;  // expiration timestamp
}

/**
 * @description Sign the JWT token
 * @param user - the user id object
 * @param options - the options for the JWT token
 * @returns the signed JWT token
 */
export const signJWT = (user: { id: number, role: string }, options?: jwt.SignOptions) => {
    return jwt.sign(user, config.JWT_SECRET, { ...(options && options) })
}

/**
 * @description Validate the JWT token
 * @param token - the JWT token in string
 * @returns object of decoded content and validity of the token
 */
export const validateToken = async (token: string) => {
    try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload;

        const checkUser = await prisma.user.findUnique({
            where: {
                id: decoded.id
            }
        })
        if (!checkUser || checkUser.role !== decoded.role) {
            return {
                decoded: null,
                valid: false
            };
        }
        return {
            decoded,
            valid: true
        }
    } catch (err) {
        return {
            decoded: null,
            valid: false
        };
    }
}