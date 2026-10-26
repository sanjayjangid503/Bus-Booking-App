import "dotenv/config"
import mongoose from "mongoose"
import connectDB from "../config/db.js"
import Route from "../models/Route.model.js"
import Bus from "../models/Bus.model.js"
import { type BusType } from "../types/bus.types.js"

const routes = [
    { from: "Delhi", to: "Jaipur", duration: 300 },
    { from: "Delhi", to: "Chandigarh", duration: 300 },
    { from: "Delhi", to: "Agra", duration: 240 },
    { from: "Jaipur", to: "Delhi", duration: 300 },
    { from: "Jaipur", to: "Chandigarh", duration: 600 },
];

const seatLayout = [
    ["A1", "A2", "", "A3", "A4"],
    ["B1", "B2", "", "B3", "B4"],
    ["C1", "C2", "", "C3", "C4"],
    ["D1", "D2", "", "D3", "D4"],
    ["E1", "E2", "", "E3", "E4"],
];

const buses = [
    {
        operator: "Rajasthan Travels",
        busNumber: "RJ14AB1001",
        busType: "AC_SEATER" as BusType,
        totalSeats: 20,
        from: "Delhi",
        to: "Jaipur",
    },
    {
        operator: "Chandigarh Express",
        busNumber: "DL01AB1002",
        busType: "AC_SLEEPER" as BusType,
        totalSeats: 20,
        from: "Delhi",
        to: "Chandigarh",
    },
    {
        operator: "Taj Travels",
        busNumber: "DL01AB1003",
        busType: "NON_AC_SEATER" as BusType,
        totalSeats: 20,
        from: "Delhi",
        to: "Agra",
    },
    {
        operator: "Pink City Travels",
        busNumber: "RJ14AB1004",
        busType: "NON_AC_SLEEPER" as BusType,
        totalSeats: 20,
        from: "Jaipur",
        to: "Delhi",
    },
    {
        operator: "Rajasthan Express",
        busNumber: "RJ14AB1005",
        busType: "AC_SEATER" as BusType,
        totalSeats: 20,
        from: "Jaipur",
        to: "Chandigarh",
    },
];

const seedData = async () => {
    try {
        await connectDB()
        const routeMap = new Map<string, mongoose.Types.ObjectId>()
        for(const routesData of routes) {
            const route = await Route.findOneAndUpdate(
                {
                    from: routesData.from,
                    to: routesData.to
                },
                {
                    $set: routesData,
                    $setOnInsert: {stopes: []}
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true
                }
            )

            routeMap.set(`${routesData.from}-${routesData.to}`, route._id)
        }

        console.log("Route seeded successfully")

        for(const busData of buses) {
            const routeId = routeMap.get(`${busData.from}-${busData.to}`);
            if(!routeId) {
                throw new Error(`Route not found: ${busData.from} to ${busData.to}`)
            }

            await Bus.findOneAndUpdate(
                {
                    busNumber: busData.busNumber
                },
                {
                    $set: {
                        operator: busData.operator,
                        busType: busData.busType,
                        totalSeats: busData.totalSeats,
                        seatLayout,
                        route: routeId
                    }
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true
                }
            )
        }

        console.log("Buses seeded successfully");
        console.log("Seed completed successfully");
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exitCode = 1;
    } finally {
         await mongoose.disconnect()
    }
}

seedData()