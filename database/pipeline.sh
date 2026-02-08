#!/usr/bin/env bash
set -e

# Database pipeline with defaults matching .github/workflows/ci.yaml
POSTGRES_DB="charai_test"
POSTGRES_USER="charai"
POSTGRES_PASSWORD="testpass"
NETWORK="charai-net"
CONTAINER_NAME="postgres-test"
IMAGE="postgres:16-alpine"

# Create network if missing
if ! docker network ls --format '{{.Name}}' | grep -q "^${NETWORK}$"; then
  docker network create "$NETWORK"
fi

docker run -d \
  -e POSTGRES_DB="$POSTGRES_DB" \
  -e POSTGRES_USER="$POSTGRES_USER" \
  -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  --network "$NETWORK" \
  --name "$CONTAINER_NAME" \
  "$IMAGE"