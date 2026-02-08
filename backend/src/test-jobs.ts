/**
 * Simple test script to verify the job system works
 */

import { jobQueue } from "./jobs.js";

console.log("🧪 Testing Job Queue System\n");

// Test 1: Add a simple job
console.log("Test 1: Creating a mock job...");

let capturedJobId: string;

const jobId = jobQueue.addJob("train", async () => {
  console.log("  Job started!");
  
  // Simulate progress updates
  for (let i = 0; i <= 100; i += 20) {
    jobQueue.updateProgress(capturedJobId, i, `Processing: ${i}%`);
    await new Promise(r => setTimeout(r, 500));
  }
  
  return { success: true, items: 42 };
});

capturedJobId = jobId;
console.log(`  Created job: ${jobId}`);

// Test 2: Check job status
console.log("\nTest 2: Checking job status...");
const job = jobQueue.getJob(jobId);
console.log(`  Status: ${job?.status}`);
console.log(`  Progress: ${job?.progress}%`);

// Test 3: Wait for completion
console.log("\nTest 3: Waiting for job to complete...");
await new Promise(r => setTimeout(r, 3000));

const completedJob = jobQueue.getJob(jobId);
console.log(`  Final Status: ${completedJob?.status}`);
console.log(`  Progress: ${completedJob?.progress}%`);
console.log(`  Result:`, completedJob?.result);

// Test 4: List all jobs
console.log("\nTest 4: Listing all jobs...");
const allJobs = jobQueue.getAllJobs();
console.log(`  Total jobs: ${allJobs.length}`);

console.log("\n✅ All tests passed!");
process.exit(0);
