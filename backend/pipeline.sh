#!/usr/bin/env bash
set -e

# USAGE:
#   ./pipeline.sh
#   ./pipeline.sh --hosts your.domain.com
#   ./pipeline.sh --opentopokey=YOUR_KEY

# Parse CLI args and export for docker compose
while [[ $# -gt 0 ]]; do
  case "$1" in
    --hosts) shift; export ALLOWED_HOSTS="$1"; shift ;;
    --hosts=*) export ALLOWED_HOSTS="${1#*=}"; shift ;;
    --opentopokey=*) export OPENTOPOGRAPHY_API_KEY="${1#*=}"; shift ;;
    *) shift ;;
  esac
done

# Start only the backend (and its dependency: postgres) via docker compose
cd "$(dirname "${BASH_SOURCE[0]}")/.." && docker compose up --build -d --wait backend
