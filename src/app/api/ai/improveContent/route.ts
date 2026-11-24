import { NextRequest, NextResponse } from "next/server";
import { IApiResponse } from "@/types/api.types";
import { GenerateImproveContentBody, ImprovedContentResponse } from "@/types/ai.types";
import { generateAiContent } from "@/lib/gemini";
import { parseAiJson } from "@/lib/parseAiJson";

export async function POST(req: NextRequest) {
    try {
        const body: GenerateImproveContentBody = await req.json();
        const { content } = body;
        const trimmedContent = content?.trim();

        if (!trimmedContent) {
            return NextResponse.json<IApiResponse>({
                success: false,
                message: "Missing required field: content",
            }, { status: 400 });
        }

        const prompt = `
You are a professional resume writer and ATS (Applicant Tracking System) optimization expert 
with deep knowledge of how recruiters and automated systems evaluate resumes.

Your task is to improve the resume content provided below by following these rules strictly:

WRITING RULES:
- Start every bullet with a powerful action verb (e.g. Led, Built, Optimized, Delivered, 
  Engineered, Spearheaded, Reduced, Increased)
- Eliminate all personal pronouns (no "I", "me", "my", "we")
- Quantify every achievement using realistic, estimated numbers inferred from the content 
  context — do NOT use placeholders like [X%], [N+], [$X], or any bracket-wrapped values.
  Infer reasonable metrics from the tech, scale, and role described 
  (e.g., "reducing load time by 35%", "serving 10K+ users", "cutting error rate by 40%")
- If no metric can be inferred, describe impact qualitatively with strong language 
  (e.g., "significantly improving performance", "at production scale") — never use brackets
- Keep each point concise: 1–2 lines maximum
- Use past tense for previous roles, present tense for current roles
- Avoid buzzwords with no substance (e.g. "hardworking", "team player", "detail-oriented")

ATS RULES:
- Use industry-standard keywords and terminology relevant to the content
- Avoid special characters, emojis, tables, or complex symbols
- Spell out acronyms on first use (e.g. "Search Engine Optimization (SEO)")
- Mirror language commonly found in job descriptions for the inferred role

Resume Content to Improve:
"""
${trimmedContent}
"""

Respond ONLY with a valid JSON object — no markdown fences, no explanation, no preamble, no trailing text:
{
  "improved": [
    "<best overall ATS-optimized version>",
    "<achievement-focused alternative>",
    "<skills and tools emphasized alternative>"
  ],
  "ats_keywords": ["<keyword1>", "<keyword2>", "<keyword3>", "<keyword4>", "<keyword5>"],
  "improvement_note": "<one specific, actionable tip for this exact content>"
}
`.trim();

        const result = await generateAiContent(prompt);

        if (!result) {
            return NextResponse.json<IApiResponse>({
                success: false,
                message: "No response received from AI",
            }, { status: 500 });
        }

        const parsed = parseAiJson<ImprovedContentResponse>(result);

        return NextResponse.json<IApiResponse<ImprovedContentResponse>>({
            success: true,
            message: "Content improved successfully",
            data: parsed,
        }, { status: 200 });

    } catch (error) {
        const isKnownError = error instanceof Error;
        console.error("Error in improve-content:", error);

        return NextResponse.json<IApiResponse>({
            success: false,
            message: isKnownError ? error.message : "Something went wrong",
        }, { status: 500 });
    }
}