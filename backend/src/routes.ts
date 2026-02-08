import { Router, type Request, type Response } from "express";
import { validateUpdateSecret } from "./auth.js";
import { generateGuideline, SUPPORTED_SCENARIOS } from "./gemini.js";
import {
  addGuideline,
  getGuidelinesJson,
  getLatest,
  uploadGuidelines,
} from "./storage.js";
import type { Guidelines, GuidelineEntry } from "./schema.js";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

router.get("/guidelines", async (_req: Request, res: Response) => {
  try {
    const json = await getGuidelinesJson();
    if (!json) {
      res.status(404).json({
        error: "No guidelines available yet. Trigger POST /update first.",
      });
      return;
    }
    res.type("application/json").send(json);
  } catch (err) {
    console.error("GET /guidelines error:", err);
    res.status(500).json({
      error: "Failed to fetch guidelines",
    });
  }
});

router.get("/latest", async (_req: Request, res: Response) => {
  try {
    const latest = await getLatest();
    if (!latest) {
      res.status(404).json({
        error: "No guidelines available yet. Trigger POST /update first.",
      });
      return;
    }
    res.json(latest);
  } catch (err) {
    console.error("GET /latest error:", err);
    res.status(500).json({
      error: "Failed to fetch latest guidelines",
    });
  }
});

router.post("/update", validateUpdateSecret, async (_req: Request, res: Response) => {
  try {
    const entries: GuidelineEntry[] = [];
    
    // Note: This endpoint will time out on Cloud Run if we do the slow loop.
    // Ideally this should trigger a background task.
    // For now, we will just generate the first one as a test or change logic later.
    // Or we assume this is handled by manual-update locally.
    
    // Let's implement a faster "batch" attempt here but if it fails it fails.
    // WARNING: This route is deprecated in favor of manual-update.ts for now.
    
    for (const scenario of SUPPORTED_SCENARIOS) {
         const entry = await generateGuideline(scenario);
         entries.push(entry);
    }
    
    const guidelines: Guidelines = {
        version: "1.0.1",
        updated_at: new Date().toISOString(),
        guidelines: entries
    };

    const latest = await uploadGuidelines(guidelines);
    res.json(latest);
  } catch (err) {
    console.error("POST /update error:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to update guidelines",
    });
  }
});
router.post("/learn", validateUpdateSecret, async (req: Request, res: Response) => {
  try {
    const { topic } = req.body;
    if (!topic || typeof topic !== "string") {
      res.status(400).json({ error: "Missing 'topic' field" });
      return;
    }

    console.log(`🧠 Learning about: ${topic}`);
    const entry = await generateGuideline(topic);
    const result = await addGuideline(entry);

    res.json({
      success: true,
      entry,
      meta: result,
    });
  } catch (err) {
    console.error("POST /learn error:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to generate guideline",
    });
  }
});


export default router;
