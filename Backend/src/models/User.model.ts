import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import type { IUser } from "../types/auth.types.js";


const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        select: false
    }
}, { timestamps: true })

userSchema.pre("save", async function() {
    if(!this.isModified("password")) return;
    
    this.password = await bcrypt.hash(this.password, 12)
} )

const User = mongoose.model<IUser>("User", userSchema)


export default User


