#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting database..."
cd "$SCRIPT_DIR/database"
./pipeline.sh

echo "Waiting for Postgres to be ready..."
timeout 30 bash -c 'until docker exec postgres-test pg_isready -U charai > /dev/null 2>&1; do sleep 1; done'

echo "Starting backend..."
cd "$SCRIPT_DIR/backend"
./pipeline.sh

echo "Running backend migrations..."
docker exec django-backend python manage.py migrate

echo "Starting frontend..."
cd "$SCRIPT_DIR/frontend"
./pipeline.sh

echo "After Containers are running, start reverse-proxy (caddy) and cloudfare tunnel."
