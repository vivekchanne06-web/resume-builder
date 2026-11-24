import jwt, { JwtPayload } from "jsonwebtoken";
import { JWTPayload } from "../types/user.types";

interface AuthTokenPayload extends JwtPayload {
  userId: string;
}

export const generateToken = (payload: JWTPayload): string => {

    return jwt.sign(payload,
         process.env.JWT_SECRET!,
        { 
            expiresIn: "1h" 
        });
};

export const verifyToken = (token: string): AuthTokenPayload => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthTokenPayload;
        return decoded;

    } catch (error) {
        console.error("Error verifying token:", error);
        throw new Error("Invalid token");
    }
};

