#!/usr/bin/env bash
set -e

# EXAMPELARY USAGE:
    # ./pipeline.sh --hosts 127.0.0.1
    # # or
    # ./pipeline.sh --hosts=127.0.0.1

# Backend pipeline with defaults matching .github/workflows/ci.yaml
IMAGE="django-backend"
INTERNAL_PORT=8000
EXTERNAL_PORT=8000
SECRET_KEY="ci-test-key"
DATABASE_URL="postgresql://charai:testpass@postgres-test:5432/charai_test"
OPENTOPOGRAPHY_API_KEY="keykey"
DEBUG="True"
ALLOWED_HOSTS="localhost,127.0.0.1,char-ai-frontend"
NETWORK="charai-net"
CONTAINER_NAME="$IMAGE"

# Parse CLI args (supports: --hosts value  OR  --hosts=value)
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

docker build -t "$IMAGE" .

docker run -d \
  -e SECRET_KEY="$SECRET_KEY" \
  -e DATABASE_URL="$DATABASE_URL" \
  -e OPENTOPOGRAPHY_API_KEY="$OPENTOPOGRAPHY_API_KEY" \
  -e DEBUG="$DEBUG" \
  -e ALLOWED_HOSTS="$ALLOWED_HOSTS" \
  --network "$NETWORK" \
  -p "$EXTERNAL_PORT":"$INTERNAL_PORT" \
  --name "$CONTAINER_NAME" "$IMAGE"
