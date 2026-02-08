# Background Jobs System

## Overview

The KIT AI backend now supports **background job execution** for long-running tasks like training and translation. This prevents API timeouts and keeps the server responsive.

## Architecture

```
┌─────────────────┐
│   API Request   │
│  POST /jobs/... │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│   Job Queue     │─────▶│  Worker Process  │
│   (in-memory)   │      │  (async)         │
└─────────────────┘      └──────────────────┘
         │                        │
         │                        ▼
         │               ┌──────────────────┐
         │               │  File System /   │
         │               │  External APIs   │
         │               └──────────────────┘
         ▼
┌─────────────────┐
│  Job Status API │
│  GET /jobs/:id  │
└─────────────────┘
```

## Features

- ✅ **Non-blocking**: Jobs run asynchronously without blocking the main server
- ✅ **Progress tracking**: Real-time progress updates via API
- ✅ **Cloud-ready**: Works on Cloud Run, Lambda, and other serverless platforms
- ✅ **Auto-cleanup**: Old completed jobs are automatically removed
- ✅ **Error handling**: Failed jobs capture error details

## API Endpoints

### Start a Training Job

Trains the AI on new medical topics from the curriculum.

```bash
POST /jobs/train
Authorization: Bearer YOUR_SECRET
```

**Response:**
```json
{
  "message": "Training job started",
  "jobId": "train-1234567890-abc123",
  "job": {
    "id": "train-1234567890-abc123",
    "type": "train",
    "status": "running",
    "progress": 0,
    "message": "Job started"
  },
  "statusUrl": "/jobs/train-1234567890-abc123"
}
```

### Start a Translation Job

Translates all guidelines to 19 languages.

```bash
POST /jobs/translate
Authorization: Bearer YOUR_SECRET
```

**Response:**
```json
{
  "message": "Translation job started",
  "jobId": "translate-1234567890-xyz789",
  "job": {
    "id": "translate-1234567890-xyz789",
    "type": "translate",
    "status": "running",
    "progress": 0,
    "message": "Job started"
  },
  "statusUrl": "/jobs/translate-1234567890-xyz789"
}
```

### Check Job Status

Monitor the progress of a background job.

```bash
GET /jobs/:id
```

**Response:**
```json
{
  "job": {
    "id": "train-1234567890-abc123",
    "type": "train",
    "status": "running",
    "progress": 45,
    "message": "Learning: Heat Stroke (32/70)",
    "startedAt": "2026-02-08T16:00:00.000Z"
  }
}
```

### List All Jobs

Get a list of all jobs (active and completed).

```bash
GET /jobs
```

**Response:**
```json
{
  "jobs": [
    {
      "id": "train-1234567890-abc123",
      "type": "train",
      "status": "completed",
      "progress": 100,
      "message": "Training complete: 70 topics learned",
      "startedAt": "2026-02-08T16:00:00.000Z",
      "completedAt": "2026-02-08T16:15:00.000Z",
      "result": {
        "learned": 70,
        "skipped": 0
      }
    }
  ]
}
```

## Job Status Values

- `pending`: Job is queued but not yet started
- `running`: Job is actively processing
- `completed`: Job finished successfully
- `failed`: Job encountered an error

## Local Development

### Start the server:

```bash
cd backend
npm run build
npm run dev
```

### Trigger a training job:

```bash
curl -X POST http://localhost:3001/jobs/train \
  -H "Authorization: Bearer your-secret-here"
```

### Check job status:

```bash
curl http://localhost:3001/jobs/train-1234567890-abc123
```

## Cloud Deployment

### Google Cloud Run

1. **Build and push the Docker image:**

```bash
docker build -t gcr.io/YOUR_PROJECT_ID/kit-ai-backend .
docker push gcr.io/YOUR_PROJECT_ID/kit-ai-backend
```

2. **Deploy using the provided script:**

```bash
cd backend/scripts
./deploy-cloud-run.sh
```

3. **Or deploy manually:**

```bash
gcloud run deploy kit-ai-backend \
  --image gcr.io/YOUR_PROJECT_ID/kit-ai-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --timeout 3600 \
  --cpu 2 \
  --memory 2Gi \
  --set-secrets "MONGODB_URI=mongodb-uri:latest,GEMINI_API_KEY=gemini-api-key:latest"
```

### AWS Lambda

For AWS Lambda, you'll need to use a different approach since Lambda has a 15-minute timeout. Consider:

1. **AWS Step Functions**: Chain multiple Lambda invocations
2. **AWS Batch**: For long-running batch jobs
3. **ECS Fargate**: Run containers with longer timeouts

### Other Cloud Platforms

- **Azure Functions**: Similar to Lambda, use Durable Functions for long-running tasks
- **Heroku**: Works out of the box with worker dynos
- **DigitalOcean App Platform**: Configure worker components

## Environment Variables

Required for background jobs:

```bash
# API Keys
GEMINI_API_KEY=your-gemini-api-key

# MongoDB (for medical routes)
MONGODB_URI=mongodb+srv://...

# Authorization (for triggering jobs)
UPDATE_SECRET=your-secret-key

# Server config
PORT=3001
FRONTEND_ORIGIN=http://localhost:5173
```

## Monitoring

### Job Progress

Jobs report progress from 0-100 and include a descriptive message:

```json
{
  "progress": 45,
  "message": "Learning: Heat Stroke (32/70)"
}
```

### Logs

Background jobs log to console. In production, these logs are captured by your cloud provider:

- **Cloud Run**: View logs in Cloud Logging
- **Lambda**: View logs in CloudWatch
- **Heroku**: Use `heroku logs --tail`

## Error Handling

If a job fails, the error is captured in the job status:

```json
{
  "id": "train-1234567890-abc123",
  "type": "train",
  "status": "failed",
  "error": "Gemini API rate limit exceeded",
  "completedAt": "2026-02-08T16:05:00.000Z"
}
```

## Security

Background jobs are protected by the same authentication as other sensitive endpoints:

- `POST /jobs/train` requires `Authorization: Bearer YOUR_SECRET`
- `POST /jobs/translate` requires `Authorization: Bearer YOUR_SECRET`
- `GET /jobs` and `GET /jobs/:id` are currently unprotected (read-only)

Set your secret in `.env`:

```bash
UPDATE_SECRET=your-secret-key
```

## Performance Tips

1. **Rate Limiting**: Jobs automatically include delays to avoid API rate limits
2. **Incremental Saves**: Training saves progress after each topic to prevent data loss
3. **Batch Processing**: Translation uses batching to reduce API calls
4. **Auto-cleanup**: Old jobs are cleaned up after 1 hour to save memory

## Troubleshooting

### Job stuck in "pending"

Check server logs for errors. The job may have failed to start.

### Job takes too long

- Training: ~4-5 seconds per topic × 70 topics = ~5-6 minutes
- Translation: ~1 second per batch × ~20 batches × 19 languages = ~7-8 minutes

These are normal times with API rate limiting.

### Job failed with API error

Check that your `GEMINI_API_KEY` is valid and has sufficient quota.

## Future Enhancements

- [ ] Persistent job storage (Redis/Database)
- [ ] Job cancellation
- [ ] Job scheduling (cron-like)
- [ ] WebSocket notifications for real-time progress
- [ ] Job retry logic
- [ ] Priority queues
- [ ] Multiple worker processes
