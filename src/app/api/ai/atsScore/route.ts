import { NextRequest, NextResponse } from "next/server";
import { IApiResponse } from "@/types/api.types";
import { AtsScoreBody, AtsScoreResponse } from "@/types/ai.types";
import { generateAiContent } from "@/lib/gemini";
import { parseAiJson } from "@/lib/parseAiJson";

export async function POST(req: NextRequest) {
    try {
        const body: AtsScoreBody = await req.json();
        const trimmedResume = body?.resumeText?.trim();

        if (!trimmedResume) {
            return NextResponse.json<IApiResponse>({
                success: false,
                message: "Missing required field: resumeText",
            }, { status: 400 });
        }

        if (trimmedResume.length < 50) {
            return NextResponse.json<IApiResponse>({
                success: false,
                message: "resumeText is too short to evaluate",
            }, { status: 400 });
        }

        if (trimmedResume.length > 10000) {
            return NextResponse.json<IApiResponse>({
                success: false,
                message: "resumeText exceeds maximum allowed length of 10,000 characters",
            }, { status: 400 });
        }

        const prompt = `
You are a senior ATS (Applicant Tracking System) evaluation engine used by Fortune 500 
recruiting teams. You have deep expertise in how ATS platforms like Workday, Greenhouse, 
Lever, and iCIMS parse, rank, and reject resumes.

Your task is to evaluate the resume text below and return a detailed, honest ATS score report.

SCORING CRITERIA — evaluate each section out of 100:

1. KEYWORDS (weight: 30%)
   - Presence of industry-standard technical and role-specific keywords
   - Keyword density — not too sparse, not stuffed
   - Use of both spelled-out terms and abbreviations (e.g., "Artificial Intelligence (AI)")
   - Action verbs at the start of bullet points

2. FORMATTING (weight: 20%)
   - Clean structure with standard section headings (Experience, Education, Skills, etc.)
   - No tables, columns, images, headers/footers, or special characters that break parsers
   - Consistent date formats (e.g., "Jan 2022 – Mar 2024")
   - Bullet points used correctly — not paragraphs

3. IMPACT (weight: 25%)
   - Quantified achievements with real numbers, percentages, or business outcomes
   - Results-oriented language (not just duties)
   - Evidence of ownership and leadership scaled to experience level
   - No vague filler phrases ("responsible for", "helped with", "assisted in")

4. READABILITY (weight: 15%)
   - Concise bullet points (1–2 lines each)
   - No personal pronouns (I, me, my, we)
   - No spelling or grammar issues detectable from the text
   - Professional, consistent tone throughout

5. COMPLETENESS (weight: 10%)
   - All essential sections present: Summary, Experience, Skills, Education
   - Contact information implied or present
   - No unexplained gaps or vague date ranges

GRADE SCALE:
- 85–100 → "Excellent" (will pass most ATS filters)
- 70–84  → "Good"      (minor improvements needed)
- 50–69  → "Fair"      (significant gaps, likely filtered out)
- 0–49   → "Poor"      (high rejection risk)

Resume Text to Evaluate:
"""
${trimmedResume}
"""

Respond ONLY with a valid JSON object — no markdown, no explanation, no preamble:
{
  "overall_score": <weighted average 0–100, integer>,
  "grade": "<Excellent | Good | Fair | Poor>",
  "sections": {
    "keywords":     { "score": <0–100>, "feedback": "<one specific sentence>" },
    "formatting":   { "score": <0–100>, "feedback": "<one specific sentence>" },
    "impact":       { "score": <0–100>, "feedback": "<one specific sentence>" },
    "readability":  { "score": <0–100>, "feedback": "<one specific sentence>" },
    "completeness": { "score": <0–100>, "feedback": "<one specific sentence>" }
  },
  "found_keywords":   ["<kw1>", "<kw2>", "<kw3>"],
  "missing_keywords": ["<gap1>", "<gap2>", "<gap3>"],
  "critical_issues":  ["<blocker1>", "<blocker2>"],
  "quick_wins":       ["<fix1>", "<fix2>", "<fix3>"]
}

RULES FOR JSON VALUES:
- overall_score must equal: (keywords*0.30 + formatting*0.20 + impact*0.25 + readability*0.15 + completeness*0.10) rounded to nearest integer
- found_keywords: keywords that ARE present and working well
- missing_keywords: high-value keywords absent that would strengthen this resume
- critical_issues: 1–3 things that will cause ATS rejection right now (be blunt)
- quick_wins: 1–3 fast, specific changes that would raise the score by 10+ points
`.trim();

        const result = await generateAiContent(prompt);

        if (!result) {
            return NextResponse.json<IApiResponse>({
                success: false,
                message: "No response received from AI",
            }, { status: 500 });
        }

        const parsed = parseAiJson<AtsScoreResponse>(result);

        // Sanity check the score
        if (
            typeof parsed.overall_score !== "number" ||
            parsed.overall_score < 0 ||
            parsed.overall_score > 100
        ) {
            return NextResponse.json<IApiResponse>({
                success: false,
                message: "AI returned an invalid score value",
            }, { status: 500 });
        }

        return NextResponse.json<IApiResponse<AtsScoreResponse>>({
            success: true,
            message: "ATS score generated successfully",
            data: parsed,
        }, { status: 200 });

    } catch (error) {
        const isKnownError = error instanceof Error;
        console.error("Error in ats-score:", error);

        return NextResponse.json<IApiResponse>({
            success: false,
            message: isKnownError ? error.message : "Something went wrong",
        }, { status: 500 });
    }
}