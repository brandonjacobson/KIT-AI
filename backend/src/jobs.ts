/**
 * Background Job Queue System
 * 
 * Handles long-running tasks (training, translation) asynchronously
 * to prevent API timeouts and keep the server responsive.
 */

import { EventEmitter } from "node:events";

export type JobStatus = "pending" | "running" | "completed" | "failed";

export interface Job {
  id: string;
  type: "train" | "translate";
  status: JobStatus;
  progress: number; // 0-100
  message: string;
  result?: any;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

class JobQueue extends EventEmitter {
  private jobs: Map<string, Job> = new Map();
  private running: boolean = false;

  /**
   * Add a new job to the queue
   */
  addJob(type: "train" | "translate", handler: () => Promise<any>): string {
    const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const job: Job = {
      id,
      type,
      status: "pending",
      progress: 0,
      message: "Job queued",
    };

    this.jobs.set(id, job);
    
    // Start processing in background (non-blocking)
    this.processJob(id, handler);
    
    return id;
  }

  /**
   * Get job status
   */
  getJob(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  /**
   * Get all jobs
   */
  getAllJobs(): Job[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Update job progress
   */
  updateProgress(id: string, progress: number, message: string) {
    const job = this.jobs.get(id);
    if (job) {
      job.progress = Math.min(100, Math.max(0, progress));
      job.message = message;
      this.emit("progress", job);
    }
  }

  /**
   * Process a job asynchronously
   */
  private async processJob(id: string, handler: () => Promise<any>) {
    const job = this.jobs.get(id);
    if (!job) return;

    try {
      job.status = "running";
      job.startedAt = new Date();
      job.message = "Job started";
      this.emit("started", job);

      const result = await handler();

      job.status = "completed";
      job.progress = 100;
      job.message = "Job completed successfully";
      job.result = result;
      job.completedAt = new Date();
      this.emit("completed", job);
    } catch (error) {
      job.status = "failed";
      job.message = "Job failed";
      job.error = error instanceof Error ? error.message : String(error);
      job.completedAt = new Date();
      this.emit("failed", job);
      console.error(`Job ${id} failed:`, error);
    }
  }

  /**
   * Clean up old completed jobs (optional, for memory management)
   */
  cleanup(maxAge: number = 3600000) { // 1 hour default
    const now = Date.now();
    for (const [id, job] of this.jobs.entries()) {
      if (
        job.completedAt &&
        now - job.completedAt.getTime() > maxAge
      ) {
        this.jobs.delete(id);
      }
    }
  }
}

// Singleton instance
export const jobQueue = new JobQueue();

// Auto-cleanup every 30 minutes
setInterval(() => {
  jobQueue.cleanup();
}, 30 * 60 * 1000);
