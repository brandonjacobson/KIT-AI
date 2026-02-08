import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is missing.");
  process.exit(1);
}
const client = new GoogleGenAI({ apiKey });

// Configuration
const BATCH_SIZE = 5;
const MODEL = "gemini-2.0-flash"; // Fast & low cost for bulk ops

// Top 20 Languages (ISO 639-1)
const LANGUAGES = [
  { code: "es", name: "Spanish" },
  { code: "zh", name: "Chinese (Simplified)" },
  { code: "hi", name: "Hindi" },
  { code: "ar", name: "Arabic" },
  { code: "fr", name: "French" },
  { code: "bn", name: "Bengali" },
  { code: "ru", name: "Russian" },
  { code: "pt", name: "Portuguese" },
  { code: "ur", name: "Urdu" },
  { code: "id", name: "Indonesian" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
  { code: "sw", name: "Swahili" },
  { code: "mr", name: "Marathi" },
  { code: "te", name: "Telugu" },
  { code: "tr", name: "Turkish" },
  { code: "vi", name: "Vietnamese" },
  { code: "ta", name: "Tamil" },
  { code: "it", name: "Italian" }
];

// File Paths
const FRONTEND_PUBLIC = path.resolve(__dirname, "../../frontend/public");
const MAIN_FILE = path.join(FRONTEND_PUBLIC, "medical-knowledge.json");
const LEARNED_FILE = path.join(FRONTEND_PUBLIC, "packs/learned.json");
const LOCALES_DIR = path.join(FRONTEND_PUBLIC, "locales");

async function loadGuidelines() {
  console.log("Loading source files...");
  
  const [mainRaw, learnedRaw] = await Promise.all([
    fs.readFile(MAIN_FILE, "utf-8").catch(() => '{"guidelines":[]}'),
    fs.readFile(LEARNED_FILE, "utf-8").catch(() => '{"guidelines":[]}')
  ]);

  const mainData = JSON.parse(mainRaw);
  const learnedData = JSON.parse(learnedRaw);

  const merged = [
    ...(mainData.guidelines || []),
    ...(learnedData.guidelines || [])
  ];

  console.log(`Loaded ${merged.length} total guidelines.`);
  return merged;
}

async function translateBatch(batch: any[], language: string) {
  const prompt = `
    You are a professional medical translator. 
    Translate the following list of First Aid guidelines into ${language}.
    
    Rules:
    1. KEEP "id" EXACTLY as is (English internal code). DO NOT translate it.
    2. TRANSLATE the following fields: "keywords" (array of strings), "steps" (array of strings), "red_flags" (array of strings), "disclaimer" (string).
    3. Output valid JSON only. Returns an array of objects.

    Input Data:
    ${JSON.stringify(batch)}
  `;

  try {
    const response = await client.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (err) {
    console.error(`Error translating batch for ${language}:`, err);
    return batch; // Fallback to original if translation fails
  }
}

async function main() {
  const guidelines = await loadGuidelines();

  for (const lang of LANGUAGES) {
    console.log(`\nStarting translation: ${lang.name} (${lang.code})`);
    
    const translatedGuidelines = [];
    
    // Batch processing
    for (let i = 0; i < guidelines.length; i += BATCH_SIZE) {
      const batch = guidelines.slice(i, i + BATCH_SIZE);
      process.stdout.write(`  Processing batch ${Math.ceil((i + 1) / BATCH_SIZE)} of ${Math.ceil(guidelines.length / BATCH_SIZE)}... `);
      
      const translatedBatch = await translateBatch(batch, lang.name);
      translatedGuidelines.push(...translatedBatch);
      
      process.stdout.write("Done.\n");
      
      // Short pause to be gentle on API limits
      await new Promise(r => setTimeout(r, 1000));
    }

    // Save
    const langDir = path.join(LOCALES_DIR, lang.code);
    await fs.mkdir(langDir, { recursive: true });
    
    const outputData = {
      version: "1.0.0",
      updated_at: new Date().toISOString(),
      guidelines: translatedGuidelines
    };

    const destFile = path.join(langDir, "medical-knowledge.json");
    await fs.writeFile(destFile, JSON.stringify(outputData, null, 2));
    console.log(`  Saved to ${destFile}`);
  }
  
  console.log("\nAll translations completed successfully.");
}

main().catch(console.error);
