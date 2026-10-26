import type { Types } from "mongoose";

export type SeatStatus = "AVAILABLE" | "LOCKED" | "BOOKED"


export interface ISeatReservation {
    bus: Types.ObjectId;
    travelDate: Date;
    seatNumber: string;
    status: SeatStatus;
    user?: Types.ObjectId;
    lockedAt?: Date;
    lockExpiresAt?: Date;
}