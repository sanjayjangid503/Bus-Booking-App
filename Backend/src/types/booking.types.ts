import type { Types } from "mongoose"

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"

export interface Passenger {
    name: string;
    age: number;
    gender: "MALE" | "FEMALE" | "OTHER";
    seat: string;
}

export interface IBooking {
    bookingNumber: string,
    user: Types.ObjectId,
    bus: Types.ObjectId,
    travelDate: Date,
    seats: string[],
    passengers: Passenger[],
    totalAmount: number,
    status: BookingStatus,
}