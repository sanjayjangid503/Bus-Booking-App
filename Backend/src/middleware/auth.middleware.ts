import type { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../constants/httpCodes.js";
import { verifyToken } from "../utils/jwt.js";

declare global {
    namespace Express {
        interface Request {
            // set by `protect`; only read in routes guarded by it
            userId: string
        }
    }
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.split(" ")[1] : undefined;
        if (!token) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: "Not authorized, token missing",
            })
        }

        req.userId = verifyToken(token);

        next()
    } catch (error) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
}
