#!/bin/bash
#
# Deploy to Google Cloud Run
#
# Prerequisites:
# 1. Install gcloud CLI: https://cloud.google.com/sdk/docs/install
# 2. Authenticate: gcloud auth login
# 3. Set project: gcloud config set project PROJECT_ID
# 4. Enable APIs: gcloud services enable run.googleapis.com containerregistry.googleapis.com
#
# Usage: ./deploy-cloud-run.sh

set -e

# Configuration
PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-"your-project-id"}
REGION=${REGION:-"us-central1"}
SERVICE_NAME="kit-ai-backend"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 Deploying KIT AI Backend to Cloud Run"
echo "   Project: $PROJECT_ID"
echo "   Region: $REGION"
echo "   Service: $SERVICE_NAME"
echo ""

# Build and push the container
echo "📦 Building Docker image..."
docker build -t $IMAGE_NAME:latest .

echo "📤 Pushing to Google Container Registry..."
docker push $IMAGE_NAME:latest

# Deploy to Cloud Run
echo "🌐 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --timeout 3600 \
  --cpu 2 \
  --memory 2Gi \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production" \
  --set-secrets "MONGODB_URI=mongodb-uri:latest,GEMINI_API_KEY=gemini-api-key:latest,MEDICAL_API_KEY=medical-api-key:latest"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Service URL:"
gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'
echo ""
echo "To trigger a training job:"
echo "  curl -X POST https://YOUR-SERVICE-URL/jobs/train -H 'Authorization: Bearer YOUR_SECRET'"
echo ""
echo "To trigger a translation job:"
echo "  curl -X POST https://YOUR-SERVICE-URL/jobs/translate -H 'Authorization: Bearer YOUR_SECRET'"
echo ""
echo "To check job status:"
echo "  curl https://YOUR-SERVICE-URL/jobs/JOB_ID"
