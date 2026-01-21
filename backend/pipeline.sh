#!/usr/bin/env bash
set -e

IMAGE_NAME="django-backend"
CONTAINER_NAME="django-backend"
INTERNAL_PORT=8000   # Port exposed by Django in the container
EXTERNAL_PORT=8000   # Default host port (can be overridden by env files)

# Resolve script directory and cd into project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

build_image() {
  echo ">>> Building Docker image: ${IMAGE_NAME}..."
  docker build -t "${IMAGE_NAME}" .
}

run_container() {
  docker run -d \
    -p "${EXTERNAL_PORT}:${INTERNAL_PORT}" \
    --name "${CONTAINER_NAME}" \
    "${IMAGE_NAME}"
}

build_image

run_container