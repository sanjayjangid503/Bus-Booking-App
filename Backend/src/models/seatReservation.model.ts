import { model, Schema } from "mongoose";
import type { ISeatReservation } from "../types/seatReservation.types.js";

const seatReservationSchema = new Schema<ISeatReservation>({
    bus: {
        type: Schema.Types.ObjectId,
        ref: "Bus",
        required: true
    },

    travelDate: {
        type: Date,
        required: true
    },

    seatNumber: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: [
            "AVAILABLE",
            "LOCKED",
            "BOOKED"
        ],
        required: true
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

    lockedAt: {
        type: Date,
    },

    lockExpiresAt: {
        type: Date,
    }
}, {timestamps: true})

seatReservationSchema.index(
    {
        bus: 1,
        travelDate: 1,
        seatNumber: 1
    },
    {
       unique: true 
    }
)
const seatReservation = model<ISeatReservation>("SeatReservation", seatReservationSchema)

export default seatReservation