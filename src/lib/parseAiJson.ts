// lib/parseAiJson.ts

/**
 * Safely parses an AI response into the expected type T.
 * Handles markdown code fences, whitespace, and malformed output gracefully.
 */
export function parseAiJson<T = unknown>(result: string | undefined): T {
    if (!result) {
        throw new Error("No response received from AI");
    }

    const cleaned = result
        .trim()
        .replace(/^```(?:json)?\s*/i, "")  // ✅ handles ```json and ``` in one pass
        .replace(/\s*```$/, "")            // ✅ handles closing fence with any trailing whitespace
        .trim();

    let parsed: unknown;

    try {
        parsed = JSON.parse(cleaned);
    } catch {
        throw new Error(
            `AI returned malformed JSON.\nRaw output: ${cleaned.slice(0, 200)}`
        );
    }

    return parsed as T;
}

/**
 * Parses and validates an AI response as a string array.
 * Use this for endpoints that explicitly expect an array of strings.
 */
export function parseAiJsonArray(result: string | undefined): string[] {
    const parsed = parseAiJson<unknown>(result);

    if (!Array.isArray(parsed)) {
        throw new Error(
            `Expected a JSON array but received: ${typeof parsed}`
        );
    }

    if (!parsed.every((item) => typeof item === "string")) {
        throw new Error(
            "Array contains non-string elements"
        );
    }

    return parsed;
}