import { Document } from "mongoose";


export interface RouteStop {
    city: string;
    arrival: string;
    departure: string
}

export interface IRoute extends Document {
    from: string;
    to: string;
    stopes: RouteStop[];
    duration: number
}