# Architecture

Gemini-powered cloud updater for offline first-aid guidelines.

## Endpoints

### Core Routes
- `GET /health` - Health check
- `GET /latest` - Returns `{ version, url, updated_at }` for PWA
- `GET /guidelines` - Serves latest guidelines JSON (local mode only)
- `POST /update` - Regenerates guidelines (requires `X-Update-Secret` header)
- `POST /learn` - Learn a single new topic (requires `X-Update-Secret` header)

### Background Jobs (New!)
- `POST /jobs/train` - Start training job for full curriculum (70+ topics)
- `POST /jobs/translate` - Start translation job (19 languages)
- `GET /jobs` - List all jobs
- `GET /jobs/:id` - Check job status and progress

See [BACKGROUND_JOBS.md](./BACKGROUND_JOBS.md) for detailed documentation.

## Run locally

**Local storage (no GCS):** Omit `GCS_BUCKET` – guidelines are saved to `./data/`.

```bash
# Minimal .env for local: GEMINI_API_KEY, UPDATE_SECRET, SKIP_AUTH=true
npm install && npm run build && npm start
```

### Running Background Jobs Locally

```bash
# Start a training job
curl -X POST http://localhost:3001/jobs/train \
  -H "Authorization: Bearer your-secret-here"

# Check job status
curl http://localhost:3001/jobs/JOB_ID
```

## Deploy to Cloud Run

See [deploy-cloud-run.sh](./scripts/deploy-cloud-run.sh) for automated deployment.

```bash
cd scripts
./deploy-cloud-run.sh
```

Background jobs work seamlessly on Cloud Run with extended timeouts (up to 60 minutes).
