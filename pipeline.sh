#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

FRONTEND_DIR="${SCRIPT_DIR}/frontend"
FRONTEND_SCRIPT="pipeline.sh"

BACKEND_DIR="${SCRIPT_DIR}/backend"
BACKEND_SCRIPT="pipeline.sh"  # rename if your backend script is named differently

cd $FRONTEND_DIR

./pipeline.sh "$@"

cd $BACKEND_DIR

./pipeline.sh "$@"

echo "After Containers are running, start reverse-proxy (caddy) and cloudfare tunnel."
