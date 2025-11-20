#!/usr/bin/env bash
set -e

###############################################################################
# Config – adjust these if your layout/script names differ
###############################################################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

FRONTEND_DIR="${SCRIPT_DIR}/frontend"
FRONTEND_SCRIPT="pipeline.sh"

BACKEND_DIR="${SCRIPT_DIR}/backend"
BACKEND_SCRIPT="pipeline.sh"  # rename if your backend script is named differently

###############################################################################
# Helpers
###############################################################################

usage() {
  cat <<EOF
Usage: $0 [local|dev|prod]

  local   Run frontend and backend locally (no containers).
  dev     Run BOTH in Docker containers using dev.env.
  prod    Run BOTH in Docker containers using prod.env.

Assumptions:
  - Frontend script: \$FRONTEND_DIR/\$FRONTEND_SCRIPT
      * local:      ./pipeline.sh
      * dev:        ./pipeline.sh -c -d
      * prod:       ./pipeline.sh -c -p
  - Backend script: \$BACKEND_DIR/\$BACKEND_SCRIPT
      * local:      ./run_backend.sh
      * dev:        ./run_backend.sh -c
      * prod:       ./run_backend.sh -c -p

Make sure both scripts are executable:
  chmod +x "\$FRONTEND_DIR/\$FRONTEND_SCRIPT" "\$BACKEND_DIR/\$BACKEND_SCRIPT"
EOF
}

MODE="$1"

if [[ -z "$MODE" || "$MODE" == "-h" || "$MODE" == "--help" ]]; then
  usage
  exit 0
fi

case "$MODE" in
  local|dev|prod) ;;
  *)
    echo "Unknown mode: $MODE"
    usage
    exit 1
    ;;
esac

# Sanity checks
if [[ ! -x "$FRONTEND_DIR/$FRONTEND_SCRIPT" ]]; then
  echo "Error: frontend script not found or not executable: $FRONTEND_DIR/$FRONTEND_SCRIPT"
  exit 1
fi

if [[ ! -x "$BACKEND_DIR/$BACKEND_SCRIPT" ]]; then
  echo "Error: backend script not found or not executable: $BACKEND_DIR/$BACKEND_SCRIPT"
  exit 1
fi

###############################################################################
# Per-mode runners
###############################################################################

run_frontend_local() {
  echo ">>> [FRONTEND] Starting local dev (npm run dev via pipeline.sh)..."
  (cd "$FRONTEND_DIR" && "./$FRONTEND_SCRIPT") &
  FRONTEND_PID=$!
}

run_backend_local() {
  echo ">>> [BACKEND] Starting local Django dev server..."
  (cd "$BACKEND_DIR" && "./$BACKEND_SCRIPT")
}

run_frontend_dev() {
  echo ">>> [FRONTEND] Starting container (dev.env)..."
  (cd "$FRONTEND_DIR" && "./$FRONTEND_SCRIPT" -c -d)
}

run_frontend_prod() {
  echo ">>> [FRONTEND] Starting container (prod.env)..."
  (cd "$FRONTEND_DIR" && "./$FRONTEND_SCRIPT" -c -p)
}

run_backend_dev() {
  echo ">>> [BACKEND] Starting container (dev.env)..."
  (cd "$BACKEND_DIR" && "./$BACKEND_SCRIPT" -c)
}

run_backend_prod() {
  echo ">>> [BACKEND] Starting container (prod.env)..."
  (cd "$BACKEND_DIR" && "./$BACKEND_SCRIPT" -c -p)
}

###############################################################################
# Main control flow
###############################################################################

if [[ "$MODE" == "local" ]]; then
  echo "=== Running FULL STACK in LOCAL mode ==="
  run_frontend_local
  run_backend_local
  echo ">>> Backend exited, stopping frontend (PID $FRONTEND_PID)..."
  kill "$FRONTEND_PID" 2>/dev/null || true
elif [[ "$MODE" == "dev" ]]; then
  echo "=== Running FULL STACK in DEV (container) mode ==="
  run_frontend_dev      # builds/runs frontend container (usually detached)
  run_backend_dev       # backend container stays in foreground
elif [[ "$MODE" == "prod" ]]; then
  echo "=== Running FULL STACK in PROD (container) mode ==="
  run_frontend_prod
  run_backend_prod
fi
