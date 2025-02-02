import { Request, Response, NextFunction } from "express";
import { createError } from "../../utils/middleware/errorHandler";

export const userRequired = (req: Request, res: Response, next: NextFunction) => {
    if (!res.locals.user) {
        next(new createError("Unauthorized", 401));
        return;
    }
    next();
}

export const adminRequired = (req: Request, res: Response, next: NextFunction) => {
    if(!res.locals.user || res.locals.user.role !== "admin"){
        next(new createError("Unauthorized", 401));
        return;
    }
    next();
}