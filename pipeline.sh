#!/usr/bin/env bash
set -e

# USAGE:
#   ./pipeline.sh
#   ./pipeline.sh --hosts your.domain.com
#   ./pipeline.sh --hosts=your.domain.com

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Parse CLI args
ALLOWED_HOSTS=""
while [[ $# -gt 0 ]]; do
	case "$1" in
		--hosts)
			shift
			if [[ -n "$1" ]]; then
				ALLOWED_HOSTS="$1"
				shift
			else
				echo "Error: --hosts requires a value" >&2
				exit 1
			fi
			;;
		--hosts=*)
			ALLOWED_HOSTS="${1#*=}"
			shift
			;;
		*)
			shift
			;;
	esac
done

cd "$SCRIPT_DIR"

# Export ALLOWED_HOSTS so docker compose picks it up
if [[ -n "$ALLOWED_HOSTS" ]]; then
	export ALLOWED_HOSTS
fi

echo "Building and starting all services..."
docker compose up --build -d --wait

echo "Running database migrations..."
docker exec django-backend python manage.py migrate

echo "All services are running."
echo "  Frontend: http://localhost:${FRONTEND_PORT:-80}"
echo "  Backend:  http://localhost:${BACKEND_PORT:-8000}"
