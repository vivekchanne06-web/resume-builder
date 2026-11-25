import { NextRequest, NextResponse } from "next/server";
import { IApiResponse } from "@/types/api.types";
import { GenerateSummeryBody } from "@/types/ai.types";
import { generateAiContent } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const body: GenerateSummeryBody = await req.json();
        const { experienceLevel, skills, jobTitle } = body;

        if (!experienceLevel || !skills || !jobTitle) {
            return NextResponse.json<IApiResponse>({
                success: false,
                message: "Missing required fields",
            }, { status: 400 });
        }

        const prompt = `
You are an expert resume writer and ATS (Applicant Tracking System) optimization specialist.

Your task is to generate a single, professional ATS-friendly resume summary.

CANDIDATE PROFILE:
- Job Title: ${jobTitle}
- Experience Level: ${experienceLevel}
- Key Skills: ${skills.join(", ")}

REQUIREMENTS:
- Length: Strictly between 50 and 80 words — count every word before responding
- Naturally incorporate the provided skills as keywords
- Use industry-standard action-oriented language
- Avoid personal pronouns (I, me, my)
- Avoid special characters, tables, or symbols that ATS cannot parse
- Quantify impact with general metrics where appropriate (e.g., "improving efficiency", "driving growth")
- Tailor tone to the experience level: ${experienceLevel}
- Start with the job title or a strong professional identity statement

STRICT OUTPUT RULES:
- Return ONLY the resume summary text
- Do NOT include labels like "Summary:", "Resume Summary:", or any heading
- Do NOT include explanations, notes, or alternatives
- Do NOT wrap output in quotes or markdown
- Output must be plain, single-block text — nothing else
- WORD COUNT ENFORCEMENT: Your response MUST be between 50 and 80 words.
  Count your words before outputting. If it exceeds 80 words, shorten it.
  If it is under 50 words, expand it. Do not respond outside this range.
        `;

        const result = await generateAiContent(prompt);

       
        if (!result) {
            return NextResponse.json<IApiResponse>({
                success: false,
                message: "No response received from AI",
                data: null
            }, { status: 500 });
        }

        return NextResponse.json<IApiResponse>({
            success: true,
            message: "Summary generated successfully",
            data: result
        }, { status: 200 });

    } catch (error) {
        console.error("Error in generate summary:", error);
        return NextResponse.json<IApiResponse>({
            success: false,
            message: "Something went wrong",
            data: null
        }, { status: 500 });
    }
}