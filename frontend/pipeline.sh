#!/usr/bin/env bash
set -e

# Frontend pipeline with defaults matching .github/workflows/ci.yaml
IMAGE="char-ai-frontend"
INTERNAL_PORT=80
EXTERNAL_PORT=80
BACKEND_URL="django-backend:8000"
LOG_LEVEL="DEBUG"
NETWORK="charai-net"
CONTAINER_NAME="$IMAGE"

docker build -t "$IMAGE" .

docker run -d \
  -e BACKEND_URL="$BACKEND_URL" \
  -e LOG_LEVEL="$LOG_LEVEL" \
  --network "$NETWORK" \
  -p "$EXTERNAL_PORT":"$INTERNAL_PORT" \
  --name "$CONTAINER_NAME" "$IMAGE"

