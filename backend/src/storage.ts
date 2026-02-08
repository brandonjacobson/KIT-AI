import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Storage } from "@google-cloud/storage";
import type { Guidelines, GuidelineEntry } from "./schema.js";

const BUCKET = process.env.GCS_BUCKET;
const PREFIX = "guidelines";
const LOCAL_DATA_DIR = process.env.LOCAL_DATA_DIR ?? "./data";

export interface LatestInfo {
  version: string;
  url: string;
  updated_at: string;
}

function isLocalMode(): boolean {
  return !BUCKET;
}

export async function uploadGuidelines(
  guidelines: Guidelines
): Promise<LatestInfo> {
  const version = guidelines.version;
  const versionedFilename = `guidelines_v${version}.json`;

  if (isLocalMode()) {
    const dir = join(LOCAL_DATA_DIR, PREFIX);
    await mkdir(dir, { recursive: true });

    const versionedPath = join(dir, versionedFilename);
    await writeFile(
      versionedPath,
      JSON.stringify(guidelines, null, 2),
      "utf-8"
    );

    const latestInfo: LatestInfo = {
      version,
      url: "/guidelines",
      updated_at: guidelines.updated_at,
    };

    const latestPath = join(dir, "latest.json");
    await writeFile(
      latestPath,
      JSON.stringify(latestInfo, null, 2),
      "utf-8"
    );

    return latestInfo;
  }

  const storage = new Storage();
  const bucket = storage.bucket(BUCKET!);
  const objectName = `${PREFIX}/${versionedFilename}`;

  const file = bucket.file(objectName);
  await file.save(JSON.stringify(guidelines, null, 2), {
    contentType: "application/json",
    metadata: {
      cacheControl: "public, max-age=3600",
    },
  });

  const latestInfo: LatestInfo = {
    version,
    url: `https://storage.googleapis.com/${BUCKET}/${objectName}`,
    updated_at: guidelines.updated_at,
  };

  const latestFile = bucket.file(`${PREFIX}/latest.json`);
  await latestFile.save(JSON.stringify(latestInfo, null, 2), {
    contentType: "application/json",
    metadata: {
      cacheControl: "public, max-age=60",
    },
  });

  return latestInfo;
}

export async function getLatest(): Promise<LatestInfo | null> {
  if (isLocalMode()) {
    try {
      const latestPath = join(LOCAL_DATA_DIR, PREFIX, "latest.json");
      const contents = await readFile(latestPath, "utf-8");
      return JSON.parse(contents) as LatestInfo;
    } catch {
      return null;
    }
  }

  const storage = new Storage();
  const bucket = storage.bucket(BUCKET!);
  const file = bucket.file(`${PREFIX}/latest.json`);

  try {
    const [contents] = await file.download();
    return JSON.parse(contents.toString()) as LatestInfo;
  } catch {
    return null;
  }
}

export async function getGuidelinesJson(): Promise<string | null> {
  if (!isLocalMode()) {
    return null;
  }

  try {
    const latest = await getLatest();
    if (!latest) return null;

    const versionedPath = join(
      LOCAL_DATA_DIR,
      PREFIX,
      `guidelines_v${latest.version}.json`
    );
    return await readFile(versionedPath, "utf-8");
  } catch {
    return null;
  }
}

export async function addGuideline(entry: GuidelineEntry): Promise<LatestInfo> {
  const json = await getGuidelinesJson();
  let guidelines: Guidelines;

  if (json) {
    guidelines = JSON.parse(json);
  } else {
    guidelines = {
      version: "1.0.0",
      updated_at: new Date().toISOString(),
      guidelines: [],
    };
  }

  const existingIndex = guidelines.guidelines.findIndex((g) => g.id === entry.id);
  if (existingIndex >= 0) {
    guidelines.guidelines[existingIndex] = entry;
  } else {
    guidelines.guidelines.push(entry);
  }

  const [major, minor, patch] = guidelines.version.split(".").map(Number);
  guidelines.version = `${major}.${minor}.${patch + 1}`;
  guidelines.updated_at = new Date().toISOString();

  const info = await uploadGuidelines(guidelines);

  if (isLocalMode()) {
    try {
      const frontendPath = join(process.cwd(), "../frontend/public/medical-knowledge.json");
      await writeFile(frontendPath, JSON.stringify(guidelines, null, 2), "utf-8");
      console.log(`Synced to frontend: ${frontendPath}`);
    } catch (err) {
      console.warn("Skipping frontend sync:", err);
    }
  }

  return info;
}
