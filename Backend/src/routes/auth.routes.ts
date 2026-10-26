import express from "express"
import { registerController, loginController, getCurrentUserController } from "../controllers/auth.controller.js"
import { protect } from "../middleware/auth.middleware.js"


const Router = express.Router()

Router.post("/register", registerController)
Router.post("/login", loginController)
Router.get("/user", protect, getCurrentUserController)




export default Router