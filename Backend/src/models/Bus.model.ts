import mongoose, { Schema, model } from "mongoose";
import type { IBus } from "../types/bus.types.js";

const busSchema = new Schema<IBus>({
    operator: {
        type: String,
        required: true,
        trim: true,
    },

    busNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },

    busType: {
        type: String,
        enum: [
            "AC_SEATER",
            "NON_AC_SEATER",
            "AC_SLEEPER",
            "NON_AC_SLEEPER",
        ],
        required: true
    },

    totalSeats: {
        type: Number,
        required: true,
        min: 1
    },

    seatLayout: {
        type: [[String]],
        required: true,
    },

    route: {
        type: Schema.Types.ObjectId,
        ref: "Route",
        required: true
    }
}, { timestamps: true })

const Bus = model<IBus>("Bus", busSchema)

export default Bus