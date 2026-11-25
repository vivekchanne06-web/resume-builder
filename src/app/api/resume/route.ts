import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoDB";
import { getCurrentUser } from "@/lib/getCurrentUser";
import ResumeModel from "@/models/resume.model";
import { IApiResponse } from "@/types/api.types";

export async function GET() {
  try {
    await connectDB();
    const userId = await getCurrentUser();

    const resumes = await ResumeModel.find({ user_id: userId }).sort({
      updatedAt: -1,
    });

    return NextResponse.json<IApiResponse>(
      {
        success: true,
        message: "Resumes fetched successfully",
        data: resumes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/resume:", error);
    return NextResponse.json<IApiResponse>(
      {
        success: false,
        message: "Failed to fetch resumes",
        data: null,
      },
      { status: 500 }
    );
  }
}