import { Request, Response, NextFunction } from "express";
import { signJWT, validateToken } from "../jwt";
import prisma from "../../database";
import { config } from "../config";
import { tokenCookieOptions } from "../../router/authRouter";


export const deserializeUser = async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    // if there is no access token, then force user to login.
    if(!accessToken){
        return next();
    }

    const decodedAT = await validateToken(accessToken);

    // if access Token is valid, then set the user in the locals
    if(decodedAT.valid && decodedAT.decoded){
        res.locals.user = decodedAT.decoded;
        return next();
    }

    // if access Token is not valid, and there is a refresh Token
    if(!decodedAT.valid && refreshToken){

        const decodedRT = await validateToken(refreshToken);
        // if refresh Token is not valid, then return next
        if(!decodedRT.valid || !decodedRT.decoded){
            return next();
        }

        const user = await prisma.user.findUnique({
            where:{
                id:decodedRT.decoded.id
            }
        })
        if(!user){
            return next();
        }

        // if user is found, then sign the access token
        const accessToken = signJWT({id:user.id},{expiresIn:config.ATTL});

        // set the access Token in the cookie
        res.cookie("accessToken",accessToken,tokenCookieOptions);

        // validate the access token, so that we can set the decoded in the locals
        const decodedAT = await validateToken(accessToken);

        // if access token is valid, and have decoded content, then set the user in the locals
        if(decodedAT.valid && decodedAT.decoded){
            res.locals.user = decodedAT.decoded;
            console.log('reissue access token');
            return next();
        }
        return next();
    }
    return next();
}