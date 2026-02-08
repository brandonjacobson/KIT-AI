import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Zod schema - exported as JSON Schema for Gemini
export const guidelineEntrySchema = z.object({
  id: z.string(), // e.g. "severe_bleeding"
  keywords: z.array(z.string()),
  steps: z.array(z.string()),
  red_flags: z.array(z.string()),
  disclaimer: z.string(),
});

export const guidelinesSchema = z.object({
  version: z.string(), // semver e.g. "1.2.0"
  updated_at: z.string(), // ISO date
  guidelines: z.array(guidelineEntrySchema),
});

export type GuidelineEntry = z.infer<typeof guidelineEntrySchema>;
export type Guidelines = z.infer<typeof guidelinesSchema>;

export function getGuidelineEntryJsonSchema(): Record<string, unknown> {
  return zodToJsonSchema(guidelineEntrySchema, { $refStrategy: "none" }) as Record<
    string,
    unknown
  >;
}
