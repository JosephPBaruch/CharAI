#!/usr/bin/env bash
set -e

# Start only the postgres service via docker compose
cd "$(dirname "${BASH_SOURCE[0]}")/.." && docker compose up -d --wait postgres