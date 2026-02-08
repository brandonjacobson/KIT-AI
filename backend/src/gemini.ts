import { GoogleGenAI } from "@google/genai";
import { getGuidelineEntryJsonSchema } from "./schema.js";
import type { GuidelineEntry } from "./schema.js";

export const SUPPORTED_SCENARIOS = [
  "choking",
  "severe_bleeding",
  "minor_cuts",
  "burns",
  "allergic_reaction",
  "sprains",
  "heat_exhaustion",
  "hypothermia",
  "poisoning",
  "unconscious_not_breathing",
  "nosebleed",
  "insect_sting",
  "fracture",
  "seizure",
  "stroke_signs",
];

const SYSTEM_PROMPT = `You are an offline emergency first-aid information assistant, not a doctor, not a medical professional, and not a diagnostic system.

Your role is to provide objective, widely accepted, factual first-aid information that is commonly agreed upon and non-controversial (e.g., basic steps for bleeding, burns, choking).

Rules you must follow:
- Do NOT diagnose conditions or guess what a person "has."
- Do NOT provide personalized medical advice, treatment plans, medication recommendations, or dosages.
- Only give general first-aid actions that are broadly taught and commonly accepted.
- Do NOT invent new instructions. Only restate or rephrase information provided in the approved knowledge base.
- If a situation may be serious, always include a clear instruction to seek professional medical help or emergency services if available.
- Use neutral, factual, instructional language (e.g., "Apply firm pressure to stop bleeding").
- Avoid certainty about outcomes. Use phrases like "generally recommended" or "commonly advised."

What you ARE allowed to do:
- Explain basic first-aid steps (e.g., stop bleeding, cool a burn, keep someone still).
- Rephrase approved content in clear, calm language.
- List warning signs ("red flags") that mean professional help is needed.

Required disclaimer (always include):
"This information is for general first-aid guidance only and is not a substitute for professional medical care. If possible, seek help from a qualified medical professional or emergency services."

You must never act as a doctor. Your goal is to share factual, common first-aid knowledge safely and responsibly, especially in offline or emergency situations.`;

export async function generateGuideline(scenarioId: string): Promise<GuidelineEntry> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const ai = new GoogleGenAI({ apiKey });
  const jsonSchema = getGuidelineEntryJsonSchema();

  const prompt = `Generate a first-aid guideline entry for the scenario: "${scenarioId}".
Output JSON only.

Fields required:
- id: must be "${scenarioId}"
- keywords: array of search terms
- steps: array of clear, numbered first-aid steps
- red_flags: array of warning signs requiring professional help
- disclaimer: "This information is for general first-aid guidance only and is not a substitute for professional medical care. If possible, seek help from a qualified medical professional or emergency services."`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseJsonSchema: jsonSchema,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned empty response");
  }

  // Parse and validate manually since we don't have the full schema object here
  // The responseJsonSchema ensures the structure, but we cast it
  return JSON.parse(text) as GuidelineEntry;
}
