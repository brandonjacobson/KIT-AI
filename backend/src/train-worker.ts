/**
 * Background Training Worker
 * 
 * Runs the training curriculum in the background without blocking the server.
 * Reports progress via the job queue system.
 */

import "dotenv/config";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { generateGuideline } from "./gemini.js";
import type { Guidelines, GuidelineEntry } from "./schema.js";
import { jobQueue } from "./jobs.js";

const LEARNED_FILE = "../frontend/public/packs/learned.json";
const CORE_FILE = "../frontend/public/medical-knowledge.json";

// The "curriculum" to learn
const CURRICULUM = [
  // Environmental
  "Frostbite", "Hypothermia", "Heat Exhaustion", "Heat Stroke", "Dehydration",
  "Altitude Sickness", "Sunburn", "Lightning Strike",

  // Water / drowning
  "Drowning (near-drowning)", "Water Aspiration", "Hypothermia After Water Exposure",

  // Bites & Stings
  "Bee Sting", "Snake Bite", "Spider Bite", "Tick Bite", "Jellyfish Sting",
  "Dog Bite", "Human Bite", "Mosquito Bites (Malaria/Dengue signs)",
  "Scorpion Sting", "Fire Ant Sting", "Marine Spine Injury (urchin/fish spine)",

  // Trauma
  "Broken Bone", "Dislocation", "Sprained Ankle", "Head Injury", "Concussion",
  "Nosebleed", "Knocked Out Tooth", "Eye Injury", "Puncture Wound",
  "Severe Bleeding", "Tourniquet Use (general info)", "Shock (basic recognition)",
  "Chest Injury", "Abdominal Injury", "Neck/Spine Injury (immobilization basics)",
  "Rib Injury", "Cuts & Lacerations", "Blisters", "Foreign Object in Skin",

  // Burns
  "Minor Burn", "Severe Burn", "Electrical Burn", "Chemical Burn", "Smoke Inhalation",

  // Breathing / airway
  "Choking (adult)", "Choking (child/infant)", "Breathing Difficulty (general)",

  // Medical Emergencies
  "Heart Attack", "Stroke", "Seizure", "Diabetic Emergency (Low Sugar)",
  "Asthma Attack", "Anaphylaxis", "Fainting",
  "Severe Allergic Reaction (non-anaphylaxis)", "Chest Pain (urgent warning signs)",
  "Severe Headache (urgent warning signs)", "Severe Abdominal Pain (urgent warning signs)",

  // Infection / illness basics
  "Fever (adult)", "Fever (child)", "Dehydration From Illness",
  "Vomiting", "Diarrhea", "Respiratory Infection Red Flags",
  "Wound Infection Signs", "Sepsis Warning Signs (general)",

  // Poisoning / exposures
  "Food Poisoning", "Carbon Monoxide Poisoning", "Mushroom Poisoning",
  "Poisoning (unknown substance)", "Medication Overdose (general emergency response)",

  // Reproductive / pediatric (high-level, urgent triage only)
  "Pregnancy Emergency Warning Signs (general)", "Child Choking & Breathing Red Flags",

  // Travel / remote care
  "When to Evacuate (remote area)", "What Info to Collect for EMT/Doctor (offline checklist)",

  // Conflict / Crisis Zone
  "Gunshot Wound", "Blast Injury", "Crush Injury", 
  "Improvised Tourniquet", "Multiple Casualty Triage (Simple START)", 
  "Stopping Severe Bleeding w/o Kit", "Tear Gas Exposure", "Pepper Spray Exposure",

  // Disaster / Power Outage
  "Water Purification (Emergency)", "Sanitation without Water", 
  "Hypothermia Prevention (No Heat)", "Heat Stroke Prevention (No AC)", 
  "Food Safety (Power Outage)",

  // Wilderness / Survival
  "Improvised Splint", "Signaling for Rescue", 
  "Emergency Shelter (Medical Context)", "Trench Foot", "Moving an Injured Person"
];

async function loadGuidelines(path: string): Promise<Guidelines | null> {
  try {
    const raw = await readFile(join(process.cwd(), path), "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function saveGuidelines(path: string, data: Guidelines) {
  await writeFile(
    join(process.cwd(), path),
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

/**
 * Run the training process in the background
 */
export async function runTraining(jobId: string): Promise<{ learned: number; skipped: number }> {
  console.log(`🎓 Starting automated training session for job ${jobId}...`);
  
  // 1. Load existing knowledge
  const core = await loadGuidelines(CORE_FILE);
  let learned = await loadGuidelines(LEARNED_FILE);

  if (!learned) {
    learned = {
      version: "1.0.0",
      updated_at: new Date().toISOString(),
      guidelines: []
    };
  }

  const existingIds = new Set([
    ...(core?.guidelines.map(g => g.id.toLowerCase()) || []),
    ...(learned.guidelines.map(g => g.id.toLowerCase()) || [])
  ]);

  // 2. Filter curriculum
  const toLearn = CURRICULUM.filter(topic => {
    const id = topic.toLowerCase().replace(/ /g, "_");
    return !existingIds.has(id);
  });

  console.log(`📚 Found ${toLearn.length} new topics to learn out of ${CURRICULUM.length} total.`);

  if (toLearn.length === 0) {
    jobQueue.updateProgress(jobId, 100, "No new topics to learn");
    return { learned: 0, skipped: CURRICULUM.length };
  }

  let learnedCount = 0;

  // 3. Learning Loop
  for (let i = 0; i < toLearn.length; i++) {
    const topic = toLearn[i];
    const progress = Math.round(((i + 1) / toLearn.length) * 100);
    
    jobQueue.updateProgress(jobId, progress, `Learning: ${topic} (${i + 1}/${toLearn.length})`);
    console.log(`\n🧠 Learning: ${topic}...`);
    
    try {
      const entry = await generateGuideline(topic);
      
      // Add to learned pack
      learned.guidelines.push(entry);
      learned.updated_at = new Date().toISOString();
      
      // Save immediately (so we don't lose progress on crash)
      await saveGuidelines(LEARNED_FILE, learned);
      
      console.log(`✅ Learned and saved.`);
      learnedCount++;
      
      // Rate limit pause
      await new Promise(r => setTimeout(r, 4000)); 
    } catch (e) {
      console.error(`❌ Failed to learn ${topic}:`, e);
    }
  }

  jobQueue.updateProgress(jobId, 100, `Training complete: ${learnedCount} topics learned`);
  console.log(`\n🎉 Training session complete! Learned ${learnedCount} topics.`);
  
  return { learned: learnedCount, skipped: CURRICULUM.length - toLearn.length };
}

/**
 * Start a background training job
 */
export function startTrainingJob(): string {
  const jobId = jobQueue.addJob("train", async () => {
    return await runTraining(jobId);
  });
  return jobId;
}
