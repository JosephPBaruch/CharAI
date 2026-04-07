#!/usr/bin/env bash
set -e

# USAGE:
#   ./pipeline.sh                        # Full build and start (first deploy)
#   ./pipeline.sh --hosts your.domain.com
#   ./pipeline.sh --hosts=your.domain.com
#   ./pipeline.sh --upgrade              # Redeploy frontend/backend only, preserve database

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Parse CLI args
ALLOWED_HOSTS=""
UPGRADE=false
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
		--upgrade)
			UPGRADE=true
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

if [ "$UPGRADE" = true ]; then
	echo "Upgrading frontend and backend (database preserved)..."
	docker compose stop frontend backend
	docker compose rm -f frontend backend
	docker compose up --build -d --wait
else
	echo "Building and starting all services..."
	docker compose up --build -d --wait
fi

echo "Running database migrations..."
docker exec django-backend python manage.py migrate

echo "All services are running."
echo "  Frontend: http://localhost:${FRONTEND_PORT:-80}"
echo "  Backend:  http://localhost:${BACKEND_PORT:-8000}"
