#!/usr/bin/env bash
set -e

# EXAMPELARY USAGE:
    # ./pipeline.sh --hosts 127.0.0.1
    # # or
    # ./pipeline.sh --hosts=127.0.0.1


SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Parse CLI args (supports: --hosts value  OR  --hosts=value)
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
			# ignore unknown args
			shift
			;;
	esac
done

echo "Starting database..."
cd "$SCRIPT_DIR/database"
./pipeline.sh

echo "Waiting for Postgres to be ready..."
timeout 30 bash -c 'until docker exec postgres-test pg_isready -U charai > /dev/null 2>&1; do sleep 1; done'

echo "Starting backend..."
cd "$SCRIPT_DIR/backend"
if [[ -n "$ALLOWED_HOSTS" ]]; then
	./pipeline.sh --hosts "$ALLOWED_HOSTS"
else
	./pipeline.sh
fi

echo "Running backend migrations..."
docker exec django-backend python manage.py migrate

echo "Starting frontend..."
cd "$SCRIPT_DIR/frontend"
./pipeline.sh

echo "After Containers are running, start reverse-proxy (caddy) and cloudfare tunnel."
