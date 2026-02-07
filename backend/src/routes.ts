import { Router, type Request, type Response } from "express";
import { validateUpdateSecret } from "./auth.js";
import { generateGuidelines } from "./gemini.js";
import {
  getGuidelinesJson,
  getLatest,
  uploadGuidelines,
} from "./storage.js";

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
    const guidelines = await generateGuidelines();
    const latest = await uploadGuidelines(guidelines);
    res.json(latest);
  } catch (err) {
    console.error("POST /update error:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to update guidelines",
    });
  }
});

export default router;
