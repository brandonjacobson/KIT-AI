---
title: Offline Medical Assistant
emoji: 🏥
colorFrom: blue
colorTo: green
sdk: gradio
sdk_version: 4.44.0
app_file: app.py
pinned: false
license: mit
---

# Offline Medical Assistant

An AI-powered medical assistant that provides first-aid guidance using a fine-tuned Llama 3 model.

## Model

This Space uses [Pablo305/llama3-medical-3b-4bit](https://huggingface.co/Pablo305/llama3-medical-3b-4bit), a 4-bit quantized medical language model.

## Features

- Provides first-aid and medical guidance
- Adjustable response length
- Fast inference with 4-bit quantization
- Runs on ZeroGPU (free tier)

## Disclaimer

This AI assistant provides general first-aid guidance only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider for any medical condition.

**In case of emergency, call your local emergency services immediately.**

## Deployment Instructions

1. **Select ZeroGPU Hardware**:
   - Go to Settings in your Space
   - Under "Space Hardware", select **ZeroGPU** (Free)

2. **Upload Files**:
   ```bash
   # Clone your Space
   git clone https://huggingface.co/spaces/Pablo305/offline-medical-assistant
   cd offline-medical-assistant

   # Copy files from this directory
   cp app.py requirements.txt README.md .

   # Commit and push
   git add .
   git commit -m "Add medical assistant app"
   git push
   ```

3. Your Space will automatically build and deploy!

## Local Testing

```bash
pip install -r requirements.txt
python app.py
```

Note: Local testing requires a CUDA-compatible GPU for the 4-bit quantization.
