import { NextRequest, NextResponse } from "next/server";
import { IApiResponse } from "@/types/api.types";
import { connectDB } from "@/lib/mongoDB";
import { getCurrentUser } from "@/lib/getCurrentUser";
import resumeModel from "@/models/resume.model";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  try {
    await connectDB();

    const userId = await getCurrentUser();
    const { resumeId } = await params;

    const resume = await resumeModel.findOne({
      _id: resumeId,
      user_id: userId,
    });

    if (!resume) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: "Resume not found",
          data: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json<IApiResponse>(
      {
        success: true,
        message: "Resume fetched successfully",
        data: resume,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in GET /api/resume/[resumeId]:", err);
    return NextResponse.json<IApiResponse>(
      {
        success: false,
        message: "Something went wrong",
        data: null,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  try {
    await connectDB();

    const userId = await getCurrentUser();
    const body = await req.json();
    const { resumeId } = await params;

    const updatedResume = await resumeModel.findOneAndUpdate(
      {
        _id: resumeId,
        user_id: userId,
      },
      {
        $set: body,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedResume) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: "Resume not found or failed to update",
          data: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json<IApiResponse>(
      {
        success: true,
        message: "Resume updated successfully",
        data: updatedResume,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in PATCH /api/resume/[resumeId]:", err);
    return NextResponse.json<IApiResponse>(
      {
        success: false,
        message: "Something went wrong",
        data: null,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  try {
    await connectDB();

    const userId = await getCurrentUser();
    const { resumeId } = await params;

    const deletedResume = await resumeModel.findOneAndDelete({
      _id: resumeId,
      user_id: userId,
    });

    if (!deletedResume) {
      return NextResponse.json<IApiResponse>(
        {
          success: false,
          message: "Resume not found",
          data: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json<IApiResponse>(
      {
        success: true,
        message: "Resume deleted successfully",
        data: deletedResume,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in DELETE /api/resume/[resumeId]:", err);
    return NextResponse.json<IApiResponse>(
      {
        success: false,
        message: "Something went wrong",
        data: null,
      },
      { status: 500 }
    );
  }
}