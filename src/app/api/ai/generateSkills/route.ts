import { NextRequest, NextResponse } from "next/server";
import { IApiResponse } from "@/types/api.types";
import { GenerateSkillsBody } from "@/types/ai.types";
import { generateAiContent } from "@/lib/gemini";
import { parseAiJsonArray } from "@/lib/parseAiJson";  

export async function POST(req: NextRequest) {
    try {
        const body: GenerateSkillsBody = await req.json();
        const { experienceLevel, jobTitle } = body;

        if (!experienceLevel || !jobTitle) {
            return NextResponse.json<IApiResponse>({
                success: false,
                message: "Missing required fields",
            }, { status: 400 });
        }

        const prompt = `
You are an expert technical recruiter and resume strategist with deep knowledge of ATS systems.

Your task is to generate a list of relevant technical skills only.

CANDIDATE PROFILE:
- Job Title: ${jobTitle}
- Experience Level: ${experienceLevel}

REQUIREMENTS:
- Generate between 10 and 15 technical skills
- Skills must be directly relevant to the job title
- Tailor the complexity of skills to the experience level: ${experienceLevel}
- Include a mix of: programming languages, frameworks, tools, libraries, and platforms
- All skills must be industry-recognized and ATS-compatible keywords
- Skills must be specific (e.g., "React.js" not "Frontend", "PostgreSQL" not "Database")
- Do NOT include soft skills (e.g., communication, teamwork, leadership)
- Do NOT include general concepts (e.g., "Problem Solving", "Agile Mindset")

STRICT OUTPUT RULES:
- Return ONLY a valid JSON array of strings
- No labels, headings, or explanations
- No markdown, no code blocks, no backticks
- No numbering or bullet points
- Output must be ONLY this format and nothing else: ["skill1", "skill2", "skill3"]
        `;

        const result = await generateAiContent(prompt);

        // ✅ FIX: Replaced 20 lines of inline parsing with shared utility
        let skills: string[];
        try {
            skills = parseAiJsonArray(result);
        } catch (error) {
            console.error("Error parsing skills JSON:", error);
            return NextResponse.json<IApiResponse>({
                success: false,
                message: "Failed to parse AI response",
                data: null
            }, { status: 500 });
        }

        return NextResponse.json<IApiResponse>({
            success: true,
            message: "Skills generated successfully",
            data: skills
        }, { status: 200 });

    } catch (error) {
        console.error("Error in generate skills:", error);
        return NextResponse.json<IApiResponse>({
            success: false,
            message: "Something went wrong",
            data: null
        }, { status: 500 });
    }
}