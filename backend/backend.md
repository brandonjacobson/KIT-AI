# Architecture

Gemini-powered cloud updater for offline first-aid guidelines.

## Endpoints

- `GET /health` - Health check
- `GET /latest` - Returns `{ version, url, updated_at }` for PWA
- `GET /guidelines` - Serves latest guidelines JSON (local mode only)
- `POST /update` - Regenerates guidelines (requires `X-Update-Secret` header)

## Run locally

**Local storage (no GCS):** Omit `GCS_BUCKET` – guidelines are saved to `./data/`.

```bash
# Minimal .env for local: GEMINI_API_KEY, UPDATE_SECRET, SKIP_AUTH=true
npm install && npm run build && npm start
```

## Deploy to Cloud Run

See plan for `gcloud run deploy` and Cloud Scheduler setup.
