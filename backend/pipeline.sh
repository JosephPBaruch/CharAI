#!/usr/bin/env bash
set -e

IMAGE_NAME="django-backend"
CONTAINER_NAME="django-backend"
INTERNAL_PORT=8000   # Port exposed by Django in the container

# Resolve script directory and cd into project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

usage() {
  echo "Usage: $0 [-c] [-p]"
  echo
  echo "  (no flags)   Run Django locally using a virtual environment (.venv)."
  echo "  -c           Build and run the Docker container using dev.env (if present)."
  echo "  -c -p        Build and run the Docker container using prod.env."
  echo
  echo "Notes:"
  echo "  - dev.env / prod.env are only used by this script to read EXTERNAL_PORT."
  echo "  - Example dev.env/prod.env:"
  echo "        EXTERNAL_PORT=8000"
  exit 1
}

container=false
prod=false

while getopts "cph" opt; do
  case "$opt" in
    c) container=true ;;
    p) prod=true ;;
    h) usage ;;
    *) usage ;;
  esac
done

# If -p is used without -c, that's a misuse
if $prod && ! $container; then
  echo "Error: -p must be used together with -c (container mode)."
  usage
fi

run_local() {
  local PORT=8000
  echo ">>> Running locally on http://127.0.0.1:${PORT} (no container)..."

  # Create venv if missing
  if [ ! -d ".venv" ]; then
    echo ">>> Creating virtual environment (.venv)..."
    python3 -m venv .venv
    echo ">>> Installing dependencies from requirements.txt..."
    # shellcheck disable=SC1091
    source .venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
  else
    echo ">>> Using existing virtual environment (.venv)..."
    # shellcheck disable=SC1091
    source .venv/bin/activate
  fi

  python manage.py runserver "0.0.0.0:${PORT}"
}

build_image() {
  echo ">>> Building Docker image: ${IMAGE_NAME}..."
  docker build -t "${IMAGE_NAME}" .
}

load_external_port() {
  local env_file="$1"

  if [ ! -f "$env_file" ]; then
    echo ">>> Warning: ${env_file} not found. Defaulting EXTERNAL_PORT=8000"
    EXTERNAL_PORT=8000
    return
  fi

  echo ">>> Loading EXTERNAL_PORT from ${env_file}..."
  # shellcheck disable=SC1090
  source "$env_file"

  if [ -z "${EXTERNAL_PORT:-}" ]; then
    echo ">>> Warning: EXTERNAL_PORT not set in ${env_file}. Defaulting EXTERNAL_PORT=8000"
    EXTERNAL_PORT=8000
  fi
}

run_container_with_envfile() {
  local env_file="$1"

  load_external_port "$env_file"

  echo ">>> Running container:"
  echo "      Host port     : ${EXTERNAL_PORT}"
  echo "      Container port: ${INTERNAL_PORT}"
  echo

  docker run --rm -it \
    -p "${EXTERNAL_PORT}:${INTERNAL_PORT}" \
    --name "${CONTAINER_NAME}" \
    "${IMAGE_NAME}"
}

if $container; then
  build_image
  if $prod; then
    # prod mode: use prod.env
    run_container_with_envfile "prod.env"
  else
    # dev mode: use dev.env
    run_container_with_envfile "dev.env"
  fi
else
  run_local
fi
