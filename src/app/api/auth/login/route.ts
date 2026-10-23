import { NextRequest, NextResponse } from "next/server";
import {connectDB} from "@/lib/mongoDB";
import { IUserLoginBody } from "@/types/user.types";
import { IApiResponse } from "@/types/api.types";
import UserModel from "@/models/user.model";
import { generateToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body: IUserLoginBody = await req.json();

        const {  email, password } = body;
        if (!email || !password) {
            return NextResponse.json<IApiResponse<null>>({
                success: false,
                message: "All fields are required",
            },
                {
                    status: 400
                });
        }

        // Add your login logic here
        const user = await UserModel.findOne({ email });
        if (!user) {
            return NextResponse.json<IApiResponse>({
                success: false,
                message: "User not found",
            },
                {
                    status: 404
                });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return NextResponse.json<IApiResponse<null>>({
                success: false,
                message: "Invalid credentials",
            },
                {
                    status: 401
                });
        }

        const token = generateToken({
            user_Id: user._id.toString(),
        });

        const response = NextResponse.json<IApiResponse>({
            success: true,
            message: "User logged in successfully",
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    mobile: user.mobile,
                }
            },
        }, {
            status: 200,
        });

        return response;

    } catch (error) {
        console.error("Error during login:", error);
        return NextResponse.json<IApiResponse>({
            success: false,
            message: "Something went wrong during login",
        },
            {
                status: 500
            });
    }

}