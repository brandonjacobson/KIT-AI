/**
 * Background Job API Routes
 * 
 * Endpoints for starting and monitoring background jobs (training, translation)
 */

import { Router, type Request, type Response } from "express";
import { validateUpdateSecret } from "../auth.js";
import { jobQueue } from "../jobs.js";
import { startTrainingJob } from "../train-worker.js";
import { startTranslationJob } from "../translate-worker.js";

const router = Router();

/**
 * GET /jobs - List all jobs
 */
router.get("/", (_req: Request, res: Response) => {
  const jobs = jobQueue.getAllJobs();
  res.json({ jobs });
});

/**
 * GET /jobs/:id - Get specific job status
 */
router.get("/:id", (req: Request, res: Response) => {
  const job = jobQueue.getJob(req.params.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json({ job });
});

/**
 * POST /jobs/train - Start a background training job
 */
router.post("/train", validateUpdateSecret, (_req: Request, res: Response) => {
  try {
    const jobId = startTrainingJob();
    const job = jobQueue.getJob(jobId);
    
    res.status(202).json({
      message: "Training job started",
      jobId,
      job,
      statusUrl: `/jobs/${jobId}`
    });
  } catch (err) {
    console.error("Failed to start training job:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to start training job"
    });
  }
});

/**
 * POST /jobs/translate - Start a background translation job
 */
router.post("/translate", validateUpdateSecret, (_req: Request, res: Response) => {
  try {
    const jobId = startTranslationJob();
    const job = jobQueue.getJob(jobId);
    
    res.status(202).json({
      message: "Translation job started",
      jobId,
      job,
      statusUrl: `/jobs/${jobId}`
    });
  } catch (err) {
    console.error("Failed to start translation job:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to start translation job"
    });
  }
});

export default router;
