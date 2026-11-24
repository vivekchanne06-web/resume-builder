// import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({
//     apiKey: process.env.GEMINI_API_KEY || "",
// });

// export async function generateAiContent(prompt: string) {
//   const response = await ai.models.generateContent({
//     model: "gemini-3.8-flash",
//     contents: prompt,
//   });

//   return response.text;
// }

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export async function generateAiContent(prompt: string) {
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b", // or another active Groq chat model ID
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return completion.choices[0]?.message?.content ?? "";
}
