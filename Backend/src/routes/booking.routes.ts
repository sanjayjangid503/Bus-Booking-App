import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { cancelBookingController, createBookingController, getBookingController, getBookingDetailsController } from "../controllers/booking.controller.js";

const Router = express.Router()

Router.post("/", protect, createBookingController)
Router.get("/", protect, getBookingController)
Router.get("/:id", protect, getBookingDetailsController)
Router.patch("/:id/cancel", protect, cancelBookingController)

export default Router