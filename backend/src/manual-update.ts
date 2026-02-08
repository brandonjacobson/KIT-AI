import "dotenv/config";
import { generateGuideline, SUPPORTED_SCENARIOS } from "./gemini.js";
import { uploadGuidelines } from "./storage.js";
import type { Guidelines, GuidelineEntry } from "./schema.js";

const DELAY_MS = 20; // 20 seconds between calls to respect Free Tier

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("🚑 Starting manual update of offline first-aid guidelines...");
  console.log("🐢 Running in SLOW & STEADY mode to avoid rate limits...");

  const entries: GuidelineEntry[] = [];
  const total = SUPPORTED_SCENARIOS.length;

  for (let i = 0; i < total; i++) {
    const scenario = SUPPORTED_SCENARIOS[i];
    console.log(`\n[${i + 1}/${total}] 🧠 Generating "${scenario}"...`);

    try {
      const entry = await generateGuideline(scenario);
      entries.push(entry);
      console.log(`✅ Done.`);
    } catch (err: any) {
      console.error(`❌ Failed to generate "${scenario}":`, err.message);
      // Continue to next scenario even if one fails
    }

    if (i < total - 1) {
      console.log(`⏳ Waiting ${DELAY_MS / 1000}s...`);
      await sleep(DELAY_MS);
    }
  }

  if (entries.length === 0) {
    console.error("❌ No guidelines generated. Exiting.");
    process.exit(1);
  }

  const generatedGuidelines: Guidelines = {
    version: "1.0.0",
    updated_at: new Date().toISOString(),
    guidelines: entries,
  };

  console.log("\n💾 Saving to local storage...");
  const info = await uploadGuidelines(generatedGuidelines);

  console.log(`🎉 Success! Guidelines updated.`);
  console.log(`📂 Location: ${info.url}`);
  console.log(`🕒 Timestamp: ${info.updated_at}`);
}

main();
