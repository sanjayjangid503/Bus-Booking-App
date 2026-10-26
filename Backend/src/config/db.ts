import mongoose from "mongoose";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async(): Promise<void> => {

    try {
        const mongoURL = process.env.DB_URL; 
        if(!mongoURL) {
            throw new Error("MONGO_URI is not defined")
        }

        await mongoose.connect(mongoURL)
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error)
        process.exit(1)
    }
}

export default connectDB