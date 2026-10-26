import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import { HTTP_STATUS } from "../constants/httpCodes.js";


export interface AuthRequest extends Request {
    userId?: string
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: "Not authorized, token missing",
            })
        }

        const token = authHeader.split(" ")[1];
        const secret = process.env.JWT_SECRET;
        const decode = jwt.verify(token, secret)
        req.userId = decode.userId;

        next()
    } catch (error) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
}