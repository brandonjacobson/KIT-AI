# KIT AI

**KIT AI** is an **offline‑first emergency health assistant** designed for situations where internet access is unreliable or unavailable—such as airplanes, hiking trails, or low‑connectivity regions.  
It provides **objective, widely accepted first‑aid information** using a **locally running AI model**, without requiring network access at the time of use.

> ⚠️ **Disclaimer:** KIT AI is **not a doctor**, does **not diagnose**, and does **not replace professional medical care**. It shares general first‑aid guidance only. In emergencies, seek professional help whenever possible.

---

## Why KIT AI Exists

Most AI health tools require constant internet access. In real emergencies, that’s often impossible.

KIT AI is built to:
- Work **fully offline**
- Run directly **on the user’s device**
- Share **clear, factual first‑aid steps**
- Avoid hallucinations, diagnoses, or personalized medical advice
- Update safely when internet *is* available

---

## What KIT AI Does

- 🧠 Uses a **local LLM** running entirely on‑device
- 📦 Stores vetted first‑aid knowledge in a **local cache**
- 💬 Provides a calm, chat‑style interface for emergencies
- 🚫 Never prescribes medication or gives diagnoses
- 🔄 Syncs updated first‑aid guidelines *only when online*

---

## What KIT AI Does NOT Do

- ❌ No user accounts or logins  
- ❌ No real‑time cloud AI calls  
- ❌ No diagnosis or treatment plans  
- ❌ No medication recommendations or dosages  
- ❌ No replacement for emergency services  

---

## Core Design Principles

### Offline‑First
Everything required to function—UI, AI model, and medical content—is downloaded once and stored locally.

### Safety‑Constrained AI
The AI model is strictly limited to:
1. Understanding the user’s question  
2. Selecting relevant, vetted first‑aid content  
3. Rephrasing that content clearly  

It **cannot invent medical advice**.

### Objective Information Only
All guidance is based on **commonly accepted, non‑controversial first‑aid practices**.

---

## High‑Level Architecture

### Client (Offline)
- Progressive Web App (PWA)
- Runs in the browser
- Cached via service worker
- Uses IndexedDB for:
  - LLM model weights
  - First‑aid knowledge base

### Local AI
- Runs via **WebGPU / WASM**
- No network access required
- Used for intent understanding + paraphrasing only

### Cloud (Optional, Online‑Only)
- Used **only to update medical content**
- Powered by a Gemini‑based updater
- Produces versioned, structured knowledge files
- Never interacts directly with end users

---

## Tech Stack

### Frontend
- React
- Vite
- Progressive Web App (PWA)
- Service Workers
- IndexedDB

### Offline AI
- `@mlc-ai/web-llm`
- WebGPU / WASM‑based inference
- Quantized local LLM models

### Medical Knowledge
- Versioned JSON files
- Cached locally
- Strict schema with:
  - Steps
  - Red flags
  - Disclaimers
  - Keywords

### Cloud Updates
- Google Cloud Run
- Gemini API
- Cloud Storage
- Cloud Scheduler
- Secret Manager

---

## Example Use Cases

- ✈️ In‑flight medical situations  
- 🏕️ Hiking or camping emergencies  
- 🌍 Regions with limited internet access  
- 📴 Disaster or outage scenarios  

---

## Ethics & Safety

KIT AI is intentionally designed to be **conservative**:
- When uncertain, it escalates to **“seek professional help”**
- It avoids personalized or speculative advice
- It prioritizes **clarity, calmness, and safety**

---

## Project Status

This project was built as a **hackathon prototype**, focused on:
- Real‑world usability
- Responsible AI design
- Offline‑capable architecture

---

## One‑Sentence Summary

> **KIT AI is an offline, safety‑constrained AI assistant that delivers factual first‑aid guidance when the internet isn’t available.**
