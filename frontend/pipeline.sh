#!/usr/bin/env bash
set -e

# Start only the frontend (and its dependencies) via docker compose
cd "$(dirname "${BASH_SOURCE[0]}")/.." && docker compose up --build -d --wait frontend

