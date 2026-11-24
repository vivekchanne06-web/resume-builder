import { NextRequest, NextResponse } from "next/server";
import { IApiResponse } from "@/types/api.types";
import { GenerateWorkExperienceDescriptionBody } from "@/types/ai.types";
import { generateAiContent } from "@/lib/gemini";
import { parseAiJsonArray } from "@/lib/parseAiJson";

export async function POST(req: NextRequest) {
    try {

        const body: GenerateWorkExperienceDescriptionBody = await req.json(); 

        const { experienceLevel, jobTitle, techStack, numberOfYears } = body;

        
        if (!experienceLevel || !jobTitle || !jobTitle.trim()) {
            return NextResponse.json<IApiResponse>({
                success: false,
                message: "Missing required fields",
            }, { status: 400 });
        }

        
        if (!Array.isArray(techStack) || techStack.length === 0) {
            return NextResponse.json<IApiResponse>({
                success: false,
                message: "techStack must be a non-empty array",
            }, { status: 400 });
        }

        if (!numberOfYears || numberOfYears < 1 || numberOfYears > 50) {
            return NextResponse.json<IApiResponse>({
                success: false,
                message: "numberOfYears must be between 1 and 50",
            }, { status: 400 });
        }

        const prompt = `
You are an expert resume writer and ATS (Applicant Tracking System) optimization specialist.

Your task is to generate a professional, ATS-friendly work experience description for a resume.

CANDIDATE PROFILE:
- Job Title: ${jobTitle}
- Experience Level: ${experienceLevel}
- Years of Experience: ${numberOfYears} year(s)
- Tech Stack: ${techStack.join(", ")}

REQUIREMENTS:
- Generate exactly 3 to 4 bullet points describing the work experience
- Each bullet point must start with a strong past-tense action verb (e.g., Built, Developed, Implemented, Designed, Optimized, Led, Architected, Delivered, Streamlined, Spearheaded)
- Naturally incorporate the tech stack as ATS keywords throughout the points
- Each bullet point must be 1 concise sentence (15–25 words max)
- Tailor the seniority, ownership, and impact to the experience level: ${experienceLevel}
- Tailor responsibilities and focus areas to match the job title: ${jobTitle}
- Reflect ${numberOfYears} year(s) worth of realistic contributions and growth
- At least 3 bullet points must include measurable impact or outcomes (e.g., "reducing deployment time by 40%", "increasing test coverage to 85%", "cutting infrastructure costs by 30%")
- Bullet points should cover a mix of: core development, collaboration, optimization, architecture, and delivery
- Do NOT include vague statements (e.g., "Worked on tasks", "Assisted the team", "Helped with development")
- Do NOT include soft skills or personal traits
- Do NOT repeat the same action verb more than once

EXPERIENCE LEVEL GUIDELINES:
- Entry-Level (0–2 yrs): Focus on individual contributions, learning, and execution under guidance
- Mid-Level (2–5 yrs): Focus on ownership, feature delivery, and cross-team collaboration
- Senior (5+ yrs): Focus on architecture decisions, mentoring, system design, and business impact

STRICT OUTPUT RULES:
- Return ONLY a valid JSON array of strings
- Each string is one bullet point (without bullet symbols or dash or numbering)
- No labels, headings, or explanations
- No markdown, no code blocks, no backticks
- Output must be ONLY this format and nothing else: ["point1", "point2", "point3", "point4", "point5"]
        `;

        const result = await generateAiContent(prompt);

        let workExperience: string[];

        try {
            workExperience = parseAiJsonArray(result);
        } catch (error) {
            console.error("Error parsing work experience JSON:", error);
            return NextResponse.json<IApiResponse>({
                success: false,
                message: "Failed to parse AI response",
                data: null
            }, { status: 500 });
        }

        return NextResponse.json<IApiResponse>({
            success: true,
            message: "Work experience generated successfully",
            data: workExperience
        }, { status: 200 });

    } catch (error) {
        console.error("Error in generate work experience:", error);
        return NextResponse.json<IApiResponse>({
            success: false,
            message: "Something went wrong",
            data: null
        }, { status: 500 });
    }
}