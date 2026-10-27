import type {Request, Response} from "express"
import { HTTP_STATUS } from "../constants/httpCodes.js"
import {cancelBookingService, createBookingService, getBookingDetailsService, getMyBookingService} from "../services/booking.service.js"

export const createBookingController = async (req: Request, res: Response) => {
    try {
        const { busId, travelDate, seats, passengers } = req.body
        const userId = req.userId
        const createBooking = await createBookingService(
            userId, 
            busId, 
            travelDate, 
            seats, 
            passengers
        ) 

        return res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: "Booking created successfully",
            result: createBooking
        })

    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal server error",
        });
    }
}   

export const getBookingController = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { status, sort } = req.query
        const page = Math.max(1, Number(req.query.page) || 1)
        const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10))
        const booking = await getMyBookingService(
            userId,
            page,
            limit,
            typeof status === "string" && status ? status : undefined,
            sort === "asc" ? "asc" : "desc"
        )

        if (!booking) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: "No Bookings found"
            })
        }

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            result: booking
        })
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal server error",
        });
    }
}

export const getBookingDetailsController = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const {id} = req.params
        const booking = await getBookingDetailsService(id, req.userId)
        if(!booking) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: "Booking not found"
            })
        }
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            booking
        })
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal server error",
        });
    }

}

export const cancelBookingController = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params
        const userId = req.userId;
        const booking = await cancelBookingService(
            id,
            userId
        )

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Booking cancelled successfully",
            booking
        })
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal server error",
        });
    }
}