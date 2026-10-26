import mongoose, { Schema } from "mongoose";
import type { IBooking, Passenger } from "../types/booking.types.js";


const passengerSchema = new Schema<Passenger>({
    name: {
        type: String,
        required: true,
        trim: true
    },

    age: {
        type: Number,
        required: true,
        min: 1
    },

    seat: {
        type: String,
        required: true,
        trim: true
    },

    gender: {
        type: String,
        enum: [
            "MALE",
            "FEMALE",
            "OTHER"
        ],
        required: true
    }
}, {_id: false})


const bookingSchema = new Schema<IBooking>({
    bookingNumber: {
        type: String,
        required: true,
        unique: true
    },

    bus: {
        type: Schema.Types.ObjectId,
        ref: "Bus",
        required: true
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    travelDate: {
        type: Date,
        required: true
    },

    passengers: {
        type: [passengerSchema],
        required: true,
        min: 1
    },

    status: {
        type: String,
        enum: [
            "PENDING",
            "CONFIRMED",
            "CANCELLED",
            "COMPLETED"
        ],
        default: "PENDING",
        required: true
    },

    seats: {
        type: [String],
        required: true,
        validate: {
            validator: (seats: string[]) => seats.length > 0,
            message: "At least one seat is required"
        }
    },

    totalAmount: {
        type: Number,
        required: true,
        min: 0
    }

}, {timestamps: true})

const Booking = mongoose.model<IBooking>("Booking", bookingSchema)

export default Booking