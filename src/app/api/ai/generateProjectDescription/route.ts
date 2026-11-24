import { NextRequest, NextResponse } from "next/server";
import { IApiResponse } from "@/types/api.types";
import { GenerateProjectDescriptionBody } from "@/types/ai.types";
import { generateAiContent } from "@/lib/gemini";
import { parseAiJsonArray } from "@/lib/parseAiJson"; 

export async function POST(req: NextRequest) {
    try {
        const body: GenerateProjectDescriptionBody = await req.json();
        const { experienceLevel, projectTitle, techStack, jobTitle } = body;

        if (!experienceLevel || !projectTitle || !techStack || !jobTitle) {
            return NextResponse.json<IApiResponse>({
                success: false,
                message: "Missing required fields",
            }, { status: 400 });
        }

        const prompt = `
You are an expert resume writer and ATS (Applicant Tracking System) optimization specialist.

Your task is to generate a professional, ATS-friendly project description for a resume.

CANDIDATE PROFILE:
- Job Title: ${jobTitle}
- Experience Level: ${experienceLevel}
- Project Title: ${projectTitle}
- Tech Stack: ${techStack.join(", ")}

REQUIREMENTS:
- Generate exactly 4 to 5 bullet points describing the project
- Each bullet point must start with a strong past-tense action verb (e.g., Built, Developed, Implemented, Designed, Optimized, Integrated)
- Naturally incorporate the tech stack as ATS keywords throughout the points
- Each bullet point must be 1 concise sentence (15–25 words max)
- Tailor the complexity and depth to the experience level: ${experienceLevel}
- Tailor the focus areas to align with the job title: ${jobTitle}
- At least 2 bullet points must reflect measurable impact or outcome (e.g., "reducing load time by 40%", "improving API response by 30%")
- Do NOT include vague statements (e.g., "Worked on the project", "Helped the team")
- Do NOT include soft skills or personal traits

STRICT OUTPUT RULES:
- Return ONLY a valid JSON array of strings
- Each string is one bullet point (without bullet symbols or numbering)
- No labels, headings, or explanations
- No markdown, no code blocks, no backticks
- Output must be ONLY this format and nothing else: ["point1", "point2", "point3", "point4", "point5"]
        `;

        const result = await generateAiContent(prompt);


        let projectDescription: string[];
        try {
            projectDescription = parseAiJsonArray(result);
        } catch (error) {
            console.error("Error parsing project description JSON:", error);
            return NextResponse.json<IApiResponse>({
                success: false,
                message: "Failed to parse AI response",
                data: null
            }, { status: 500 });
        }

        return NextResponse.json<IApiResponse>({
            success: true,
            message: "Project description generated successfully",
            data: projectDescription
        }, { status: 200 });

    } catch (error) {
        console.error("Error in generate project description:", error);
        return NextResponse.json<IApiResponse>({
            success: false,
            message: "Something went wrong",
            data: null
        }, { status: 500 });
    }
}