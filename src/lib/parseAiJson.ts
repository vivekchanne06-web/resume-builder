// lib/parseAiJson.ts

export function parseAiJsonArray(result: string | undefined): string[] {

    if (!result) {
        throw new Error("No response received from AI");
    }

    const cleaned = result
        .trim()
        .replace(/^```json/, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();


    const parsed = JSON.parse(cleaned);


    if (!Array.isArray(parsed)) {
        throw new Error("Invalid response format from AI");
    }

    return parsed as string[];
}