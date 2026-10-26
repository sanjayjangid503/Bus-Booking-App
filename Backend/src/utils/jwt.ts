import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET

if(!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined")
}

export const tokenGeneration = (userId: string): string => {
    return jwt.sign({userId}, JWT_SECRET,
        {
            expiresIn: "7d",
            algorithm: "HS256",
        }
    )
}


export const verifyToken = (token: string): string => {
    const decode = jwt.verify(token, JWT_SECRET, {
        algorithms: ["HS256"],
    });

    if(typeof decode === "string" || typeof decode.userId !== "string") {
        throw new Error("Invalid token payload")
    }

    return decode.userId;

}