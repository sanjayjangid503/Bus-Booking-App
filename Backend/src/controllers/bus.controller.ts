import type {Request, Response} from "express"
import type { BusSearchQuery } from "../types/bus.types.js";
import { busSearchService,
    getBusService,
    getCitiesService,
    getSeatService,
    lockSeatDeleteService,
    lockSeatsService
} from "../services/bus.service.js";
import { HTTP_STATUS } from "../constants/httpCodes.js";

export const getCitiesController = async (req: Request, res: Response) => {
    try {
        const cities = await getCitiesService()
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            result: cities
        })
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to get cities",
        })
    }
}

export const searchBusController = async (req: Request<{}, {}, {}, BusSearchQuery>, res: Response) => {
    try {
        const buses = await busSearchService(req.query)
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            result: buses
        });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to search buses", error,
        })
    }
}

export const getBusController = async (req: Request, res: Response) => {
    try {
        const buses = await getBusService(req.params)
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            result: buses
        })
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to search buses", error,
        })
    }
}

export const getSeatController = async (req: Request, res: Response) => {
    try {
        const {id} = req.params
        const {date} = req.query
        if(!date || typeof date !== "string") {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "Date is required"
            }) 
        }
        const seats = await getSeatService(id, date)
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            seats,
        });
        
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to get bus seats", error,
        });

    }
}

export const lockSeatController = async(req: Request, res: Response) => {
    try {
        const {id} = req.params
        const { travelDate, seats } = req.body

        if (
            typeof travelDate !== "string" ||
            !Array.isArray(seats) ||
            !seats.every((seat: unknown) => typeof seat === "string")
        ) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "travelDate and seats are required",
            });
        }

        const userId = req.userId
        const lockSeats = await lockSeatsService(
            id, 
            travelDate,
            seats, 
            userId
        )

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Seats locked successfully for 5 minutes",
            data: lockSeats,
        });

    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Internal server error";

        const status = [
            "Invalid bus ID",
            "Invalid user ID",
            "Invalid travel date; use YYYY-MM-DD",
            "Provide unique, valid seat numbers",
            "Bus not found",
            "One or more seats do not exist on this bus",
        ].includes(message)
            ? HTTP_STATUS.BAD_REQUEST
            : message.startsWith("Seat ")
                ? HTTP_STATUS.CONFLICT
                : HTTP_STATUS.INTERNAL_SERVER_ERROR;

        return res.status(status).json({
            success: false,
            message,
        });
    }
}

export const deleteSeatController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { travelDate, seats } = req.body ?? {}

        if (
            typeof travelDate !== "string" ||
            !Array.isArray(seats) ||
            seats.length === 0 ||
            !seats.every((seat: unknown) => typeof seat === "string")
        ) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "travelDate and seats are required",
            });
        }

        const result = await lockSeatDeleteService(id, travelDate, seats, req.userId)
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Seat lock released",
            data: result
        })

    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Internal server error";

        const status = [
            "Invalid bus ID",
            "Invalid user ID",
            "Invalid travel date; use YYYY-MM-DD",
        ].includes(message)
            ? HTTP_STATUS.BAD_REQUEST
            : HTTP_STATUS.INTERNAL_SERVER_ERROR;

        return res.status(status).json({
            success: false,
            message,
        });
    }
}