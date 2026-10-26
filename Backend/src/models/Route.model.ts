import { model, Schema } from "mongoose";
import type { IRoute, RouteStop } from "../types/routes.types.js";


const routeStopSchema = new Schema<RouteStop>({
    city: {
        type: String,
        required: true,
    },

    arrival: {
        type: String,
        required: true,
    },

    departure: {
        type: String,
        required: true,
    }
}, {_id: false})

const routeSchema = new Schema<IRoute>({
    from: {
        type: String,
        required: true,
    },

    to: {
        type: String,
        required: true,
    },

    stopes: {
        type: [routeStopSchema],
        default: []
    },

    duration: {
        type: Number,
        required: true,
        min: 1,
    }
}, {timestamps: true})


const Route = model<IRoute>("Route", routeSchema)

export default Route