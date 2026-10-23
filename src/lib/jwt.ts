import jwt from "jsonwebtoken";
import { JWTPayload } from "../types/user.types";

export const generateToken = (payload: JWTPayload): string => {

    return jwt.sign(payload,
         process.env.JWT_SECRET!,
        { 
            expiresIn: "1h" 
        });
};

export const verifyToken = (token: string)=> {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        return decoded;

    } catch (error) {
        console.error("Error verifying token:", error);
        throw new Error("Invalid token");
    }
};