import express from "express"
import { searchBusController, getBusController, getSeatController, lockSeatController, deleteSeatController, getCitiesController} from "../controllers/bus.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const Router = express.Router()

Router.get("/search", searchBusController)
Router.get("/cities", getCitiesController)
Router.get("/:id", getBusController)
Router.get("/:id/seats", getSeatController)
Router.post("/:id/seats/lock", protect, lockSeatController)
Router.delete("/:id/seats/lock", protect, deleteSeatController)

export default Router
