import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

// Paths relative to where the script runs (backend root)
const PUBLIC_DIR = join(process.cwd(), "../frontend/public/guidelines");
const LATEST_PATH = join(PUBLIC_DIR, "latest.json");
const MSG_FILE = join(PUBLIC_DIR, "medical-knowledge.json");

try {
  console.log("📦 Creating compatibility dump...");
  
  if (!existsSync(LATEST_PATH)) {
     console.error("❌ latest.json not found. Run manual-update first.");
     process.exit(1);
  }

  const latest = JSON.parse(readFileSync(LATEST_PATH, "utf-8"));
  const version = latest.version;
  const guidelinesFile = join(PUBLIC_DIR, `guidelines_v${version}.json`);
  
  console.log(`📖 Reading source: ${guidelinesFile}`);
  const data = JSON.parse(readFileSync(guidelinesFile, "utf-8"));
  
  // Convert structured data to the flat "Expert Content" format teammates expect
  const entries = data.guidelines.map((g: any) => {
    const content = [
      `# ${g.id.toUpperCase()}`,
      `**Keywords**: ${g.keywords.join(", ")}`,
      "",
      "## Steps",
      ...g.steps.map((s: string) => `- ${s}`),
      "",
      "## Red Flags",
      ...g.red_flags.map((f: string) => `- ${f}`),
      "",
      `> **Disclaimer**: ${g.disclaimer}`
    ].join("\n");
    
    return { id: g.id, content };
  });

  const output = { version: 1, entries };
  writeFileSync(MSG_FILE, JSON.stringify(output, null, 2));
  console.log(`✅ Success! Wrote ${entries.length} entries to:`);
  console.log(`   ${MSG_FILE}`);
} catch (e) {
  console.error("❌ Error:", e);
  process.exit(1);
}
