import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoDB";
import { IUserRegisterBody } from "@/types/user.types";
import { IApiResponse } from "@/types/api.types";
import UserModel from "@/models/user.model";
import { generateToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body: IUserRegisterBody = await req.json();

        const { name, email, mobile, password } = body;

        if (!name || !email || !mobile || !password) {

            return NextResponse.json<IApiResponse<null>>({
                success: false,
                message: "All fields are required",
            },
                {
                    status: 400
                });
        }

        const isExisted = await UserModel.findOne({ email });
        if (isExisted) {
            return NextResponse.json<IApiResponse<null>>({
                success: false,
                message: "User already exists",
            },
                {
                    status: 409
                });
        }

        const newUser = await UserModel.create({
            name,
            email,
            mobile,
            password
        });

        const token = generateToken({
            user_Id: newUser._id.toString(),
        });

        const response = NextResponse.json<IApiResponse>({
            success: true,
            message: "User registered successfully",
            data: {
                user: {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    mobile: newUser.mobile,
                },
            },
        }, {
            status: 201,
        });


        response.cookies.set("token", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 1000,
        })

        return response;

    } catch (error) {
        console.error("Error during registration:", error);
        return NextResponse.json<IApiResponse>({
            success: false,
            message: "Something went wrong during registration",
        },
            {
                status: 500
            });
    }

}