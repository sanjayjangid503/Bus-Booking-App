import type {Request, Response} from "express"
import { HTTP_STATUS } from "../constants/httpCodes.js"
import { createUserService, loginUserService, getUserService } from "../services/auth.service.js"
import { tokenGeneration } from "../utils/jwt.js"


export const registerController = async (req: Request , res: Response) => {
    try {
        const {name, email, password} = req.body
        if(!name || !email || !password) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "All fields are required",
            })
            return;
        }

        const user = await createUserService({name, email, password})

        const token = tokenGeneration(user._id.toString())

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: "User created successfully",
            data: user,
            token
        })
        
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "Email already exists"
        ) {
            res.status(HTTP_STATUS.CONFLICT).json({
                success: false,
                message: error.message,
            });
            return;
        }

        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export const loginController = async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body
        if(!email || !password) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "Email and password are required",
            })
            return;
        }

        const user = await loginUserService({email, password})
        const token = tokenGeneration(user._id.toString())

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Login successfully",
            token,
            data: user,
        })
        
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "Invalid email or password"
        ) {
            res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: error.message,
            });
            return;
        }

        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export const getCurrentUserController = async (req: Request, res: Response) => {
    try {
        const user = await getUserService(req.userId)
        if (!user) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            user: user
        })
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error",
        });
    }
}