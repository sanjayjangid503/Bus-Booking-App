import bcrypt from "bcrypt";
import User from "../models/User.model.js";
import type { ILoginInput, IUser } from "../types/auth.types.js";

export const createUserService = async (userInput: IUser) => {
    const {name, email, password} = userInput;
    const existedUser = await User.findOne({email: email.toLowerCase()})
    if(existedUser) {
        throw new Error("Email already exists");
    }

    const user = await User.create({
        name, 
        email,
        password
    })

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
    }
}

export const loginUserService = async (userInput: ILoginInput) => {
    const {email, password} = userInput;
    const user = await User.findOne({email: email.toLowerCase()}).select("+password")
    if(!user) {
        throw new Error("Invalid email or password")
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) {
        throw new Error("Invalid email or password")
    }

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
    }
}

export const getUserService = async (userId: string) => {
    const user = await User.findById(userId)
    return user
}
