import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoDB";
import { getCurrentUser } from "@/lib/getCurrentUser";
import resumeModel from "@/models/resume.model";
import { IApiResponse } from "@/types/api.types";


export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const userId = await getCurrentUser();

        const newResume = await resumeModel.create({
            user_id: userId,
            title: "Untitled Resume",
            summary: "A brief summary of my professional background and goals.",
            personalInfo: {},
            workExperience: [],
            projects: [],
            skills: [],
            education: [],
            certifications: []
        });

        return NextResponse.json<IApiResponse>({
            success: true,
            message: "Resume created successfully",
            data: newResume
        }, { status: 201 });

    } catch (error) {
        console.error("Error in create resume:", error);
        return NextResponse.json<IApiResponse>({
            success: false,
            message: "Something went wrong ",
            data: null
        }, { status: 500 });
    }
}