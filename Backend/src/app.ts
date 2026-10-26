import express, {type Express} from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes.js"
import busRouter from "./routes/bus.route.js"
import bookingRouter from "./routes/booking.routes.js"


const app: Express = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRouter)
app.use("/api/buses", busRouter), 
app.use("/api/bookings", bookingRouter)

export default app;

    