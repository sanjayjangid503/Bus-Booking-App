import mongoose from "mongoose"
import Bus from "../models/Bus.model.js"
import User from "../models/User.model.js"
import seatReservation from "../models/seatReservation.model.js"
import { randomUUID } from "node:crypto";
import Booking from "../models/Booking.model.js";
import type { Passenger } from "../types/booking.types.js";

export const createBookingService = async (
    userId: string,
    busId: string,
    travelDate: string,
    seats: string[],
    passengers: Passenger[]
) => {
    const user = await User.findById(userId)
    if(!user) {
        throw new Error("User not found")
    }

    if(!mongoose.isValidObjectId(busId)) {
        throw new Error("Invalid bus ID")
    }

    const bus = await Bus.findById(busId)
    if(!bus) {
        throw new Error("Bus not found")
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(travelDate)) {
        throw new Error("Invalid travel date format");
    }

    const normalizedDate = new Date(`${travelDate}T00:00:00.000Z`);

    if (
        Number.isNaN(normalizedDate.getTime()) ||
        normalizedDate.toISOString().slice(0, 10) !== travelDate
    ) {
        throw new Error("Invalid travel date");
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (normalizedDate < today) {
        throw new Error("Travel date cannot be in the past");
    }

    if(!Array.isArray(seats) || seats.length === 0) {
        throw new Error("Please select at least one seat")
    }

    if(new Set(seats).size !== seats.length) {
         throw new Error("Duplicate seats are not allowed");
    }

    const availableSeatNumbers  =  bus.seatLayout.flat()
    const validSeats = availableSeatNumbers.filter((seat) => seat.trim() !== "")
    const invalidSeats = seats.filter(
        (seat) => !validSeats.includes(seat)
    )

    if(invalidSeats.length > 0) {
        throw new Error(`Invalid seats: ${invalidSeats.join(", ")}`);
    }

    const reservations = await seatReservation.find({
        bus: bus._id,
        travelDate: normalizedDate,
        seatNumber: {$in: seats}
    })

    const bookedSeats = reservations.filter(
        (reservation) => reservation.status == "BOOKED"
    )

    if(bookedSeats.length > 0) {
        throw new Error(
            `Seats already Booked: ${bookedSeats.map((reservation) => reservation.seatNumber).join(", ")}`
        )
    }

    const now = new Date()
    const lockedByOthers = reservations.filter(
        (reservation) =>
            reservation.status === "LOCKED" &&
            reservation.lockExpiresAt &&
            reservation.lockExpiresAt > now &&
            reservation.user?.toString() != userId
    );

    
    if (lockedByOthers.length > 0) {
        throw new Error(
            `Seats locked by another user: ${lockedByOthers
                .map((reservation) => reservation.seatNumber)
                .join(", ")}`
        );
    }

    if(!Array.isArray(passengers) || passengers.length == 0) {
        throw new Error("At least one passenger is required");
    }

    if (passengers.length !== seats.length) {
        throw new Error("Passenger count must match the number of selected seats");
    }

    for (const passenger of passengers) {
        if (
            typeof passenger.name !== "string" ||
            passenger.name.trim().length === 0
        ) {
            throw new Error("Passenger name is required");
        }

        if (
            !Number.isInteger(passenger.age) ||
            passenger.age < 1
        ) {
            throw new Error(`Invalid age for passenger ${passenger.name}`);
        }

        if (!["MALE", "FEMALE", "OTHER"].includes(passenger.gender)) {
            throw new Error(`Invalid gender for passenger ${passenger.name}`);
        }
    }

    const passengerSeats = passengers.map(
        (passenger) => passenger.seat
    )

    if(new Set(passengerSeats).size !== passengerSeats.length) {
         throw new Error("Multiple passengers cannot use the same seat");
    }

    for(const passenger of passengers) {
        if(!seats.includes(passenger.seat)) {
            throw new Error(
                `Passenger ${passenger.name} has an invalid seat assignment`
            );
        }
    } 

    if (
        seats.length !== passengerSeats.length ||
        !seats.every((seat) => passengerSeats.includes(seat))
    ) {
        throw new Error("Each selected seat must have exactly one passenger");
    }

    const pricePerSeat = 850;
    const totalAmount = pricePerSeat * seats.length;

    const bookingNumber = `BUS-${randomUUID().slice(0, 8).toUpperCase()}`;

    const session = await mongoose.startSession()

    try {
        let createdBooking;

        await session.withTransaction(async() => {
            const now = new Date()
            const userObjectId = new mongoose.Types.ObjectId(userId)

            for (const seat of seats) {
                const result = await seatReservation.updateOne(
                    {
                        bus: bus._id,
                        travelDate: normalizedDate,
                        seatNumber: seat,
                        $or: [
                            {status: "AVAILABLE"},
                            {
                                status: "LOCKED",
                                user: userObjectId,
                                lockExpiresAt: { $gt: now }
                            },
                            {
                                status: "LOCKED",
                                lockExpiresAt: { $lte: now }
                            }
                        ]
                    },
                    {
                        $set: {
                            status: "BOOKED",
                            user: userObjectId
                        },
                        $unset: {
                            lockedAt: "",
                            lockExpiresAt: ""
                        }
                    },
                    {session}
                );

                if (result.modifiedCount === 0) {
                    const existing = await seatReservation.findOne({
                        bus: bus._id,
                        travelDate: normalizedDate,
                        seatNumber: seat,
                    }).session(session);

                    if (existing) {
                        throw new Error(`Seat ${seat} is no longer available. Please try again.`);
                    }

                    await seatReservation.create(
                        [{
                            bus: bus._id,
                            travelDate: normalizedDate,
                            seatNumber: seat,
                            status: "BOOKED",
                            user: userObjectId,
                        }],
                        {session}
                    );
                }
            }

            const booking = await Booking.create(
                [
                    {
                        bookingNumber,
                        user: user._id,
                        bus: bus._id,
                        travelDate: normalizedDate,
                        seats,
                        passengers,
                        totalAmount,
                        status: "CONFIRMED"
                    }
                ],
                {session}
            )
            createdBooking = booking[0]
        })

        return createdBooking
    } finally {
        await session.endSession();
    }

}

export const getMyBookingService = async(
    userId: string,
    page: number,
    limit: number,
    status?: string,
    sort: "asc" | "desc" = "desc"
) => {
    const filter: any = { user: userId }
    if(status) {
        filter.status = status
    }

    const skip = (page - 1) * limit
    const bookings = await Booking.find(filter)
        .populate({ path: "bus", populate: { path: "route" } })
        .sort({createdAt: sort === "asc" ? 1 : -1})
        .skip(skip)
        .limit(limit)

    const total = await Booking.countDocuments(filter)

    return {
        bookings,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    }

}

export const getBookingDetailsService = async (id: string, userId: string) => {
    if (!mongoose.isValidObjectId(id)) {
        return null
    }

    const booking = await Booking.findOne({ _id: id, user: userId })
        .populate({ path: "bus", populate: { path: "route" } })
    return booking
}

export const cancelBookingService = async (bookingId: string, userId: string) => {
    const session = await mongoose.startSession()
    try {
        let cancelledBooking;
        await session.withTransaction(async () => {
            const booking = await Booking.findById(bookingId).session(session)
            if (!booking) {
                throw new Error("Booking not found");
            }

            if(booking.user.toString() !== userId) {
                throw new Error("You are not allowed to cancel this booking");
            }

            if(booking.status == "COMPLETED" ) {
                 throw new Error("Completed bookings cannot be cancelled");
            }

            if(booking.status == "CANCELLED") {
                throw new Error("Booking is already cancelled")
            }
            
            booking.status = "CANCELLED"
            await booking.save({session})

            await seatReservation.updateMany(
                {
                    bus: booking.bus,
                    travelDate: booking.travelDate,
                    seatNumber: {$in: booking.seats},
                    status: "BOOKED"
                },
                {
                    $set: {
                        status: "AVAILABLE",
                        user: null,
                        lockedAt: null,
                        lockExpiresAt: null
                    }
                },
                {session}
            )

            cancelledBooking = booking
        });

        return cancelledBooking
    } finally {
        await session.endSession()
    }
}