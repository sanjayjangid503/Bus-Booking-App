import type { Types, Document } from "mongoose";

export type BusType = "AC_SEATER" | "NON_AC_SEATER" | "AC_SLEEPER" | "NON_AC_SLEEPER";

export interface IBus extends Document {
    operator: string;
    busNumber: string;
    busType?: BusType;
    totalSeats: number;
    seatLayout: string[][];
    route: Types.ObjectId;
}

export interface BusSearchQuery {
    from?: string;
    to?: string;
    date?: string;
    busType: BusType;
    minPrice?: number;
    maxPrice?: number;
    departureTime?: string;
    page?: number;
    limit?: number;
    sort?: string
}