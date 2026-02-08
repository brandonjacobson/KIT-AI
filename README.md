# KIT AI

**KIT AI** is an **offline-first emergency health assistant** designed for situations where internet access is unreliable or unavailable—such as airplanes, hiking trails, or low-connectivity regions.  
It provides **objective, widely accepted first-aid information** using a **locally running AI model**, without requiring network access at the time of use.

> **Disclaimer:** KIT AI is **not a doctor**, does **not diagnose**, and does **not replace professional medical care**. It shares general first-aid guidance only. In emergencies, seek professional help whenever possible.

---

## Why KIT AI Exists

Most AI health tools require constant internet access. In real emergencies, that's often impossible.

KIT AI is built to:
- Work **fully offline**
- Run directly **on the user's device**
- Share **clear, factual first-aid steps**
- Avoid hallucinations, diagnoses, or personalized medical advice
- Update medical content safely when internet *is* available

---

## What KIT AI Does

- Uses a **local LLM** (WebLLM) running entirely on-device via WebGPU
- Stores vetted first-aid knowledge in **IndexedDB** (syncs from backend when online)
- Provides a chat-style interface for health questions
- Never prescribes medication or gives diagnoses
- Syncs updated medical guidelines *only when online*

---

## What KIT AI Does NOT Do

- No user accounts or logins
- No real-time cloud AI calls during inference
- No diagnosis or treatment plans
- No medication recommendations or dosages
- No replacement for emergency services

---

## Architecture

### Frontend (PWA)
- React + Vite
- Progressive Web App with service worker
- IndexedDB for:
  - LLM model weights (WebLLM cache)
  - Medical knowledge (synced from backend when online)

### Local AI
- `@mlc-ai/web-llm` in a Web Worker
- WebGPU / WASM inference
- Model: Llama-3.2-3B-Instruct (configurable)

### Backend (Online Only)
- Node.js + Express
- MongoDB Atlas for medical content
- Gemini API for knowledge generation and translation
- **Background job system** for long-running tasks (training, translation)
- `GET /api/medical` — frontend fetches and caches when online
- `POST /api/medical` — webscraper or ingest script updates content
- `POST /jobs/train` — trigger background training job for curriculum
- `POST /jobs/translate` — trigger background translation job (19 languages)

See [backend/BACKGROUND_JOBS.md](./backend/BACKGROUND_JOBS.md) for details on the background job system.

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React, Vite, Tailwind CSS, PWA |
| Local AI | @mlc-ai/web-llm, WebGPU |
| Backend | Node.js, Express, MongoDB |
| Storage | IndexedDB (frontend), MongoDB Atlas (backend) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Browser with WebGPU (Chrome 113+, Edge 113+, Safari 26+, Firefox 141+)

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MONGODB_URI, PORT, FRONTEND_ORIGIN
npm install
npm run dev
```

Ingest initial medical content (with backend running):

```bash
npm run ingest
# Or: npm run ingest path/to/medical-knowledge.json
```

### Frontend

```bash
cd frontend
cp .env.example .env
# For API mode: set VITE_MEDICAL_SOURCE=api and VITE_MEDICAL_API_URL
npm install
npm run dev
```

Visit `http://localhost:5173`. On first load (while online), the model downloads and medical content syncs. After that, the app works offline.

---

## Configuration

### Frontend (`.env`)
| Variable | Description |
|----------|-------------|
| `VITE_MEDICAL_SOURCE` | `api` or `static` |
| `VITE_MEDICAL_API_URL` | Backend URL, e.g. `http://localhost:3001/api/medical` |

### Backend (`.env`)
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `PORT` | Server port (default 3001) |
| `FRONTEND_ORIGIN` | CORS origin (default `http://localhost:5173`) |
| `MEDICAL_API_KEY` | Optional; required for POST /api/medical when set |

---

## Medical Content Format

```json
{
  "version": 1,
  "entries": [
    { "id": "topic-id", "content": "Medical content..." }
  ]
}
```

The webscraper outputs this format. Use `npm run ingest` in the backend to push it to MongoDB.

---

## Example Use Cases

- In-flight medical situations
- Hiking or camping emergencies
- Regions with limited internet access
- Disaster or outage scenarios

---

## Ethics & Safety

KIT AI is intentionally **conservative**:
- When uncertain, it escalates to "seek professional help"
- It avoids personalized or speculative advice
- It prioritizes clarity, calmness, and safety

---

## Project Status

Active development. Current features:
- WebLLM-based offline chat
- Medical knowledge cache with backend sync
- PWA with IndexedDB caching
