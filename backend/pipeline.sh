#!/usr/bin/env bash
set -e

usage() {
    echo "Usage: $0 [-i image] [-P internal_port] [-p external_port] [-f env_file]"
    exit 1
}

IMAGE="char-ai-backend"
INTERNAL_PORT=8000
EXTERNAL_PORT=8000
ENV_FILE=""

while getopts ":i:P:p:f:h" opt; do
    case "${opt}" in
        i) IMAGE="$OPTARG" ;;
        P) INTERNAL_PORT="$OPTARG" ;;
        p) EXTERNAL_PORT="$OPTARG" ;;
        f) ENV_FILE="$OPTARG" ;;
        h) usage ;;
        *) usage ;;
    esac
done

if [ -n "$ENV_FILE" ]; then
    if [ ! -f "$ENV_FILE" ]; then
        echo "Env file not found: $ENV_FILE" >&2
        exit 1
    fi
    set -a
    # shellcheck disable=SC1090
    source "$ENV_FILE"
    set +a
fi

: "${SECRET_KEY:=supersecretkey}"
: "${DATABASE_URL:=postgresql://charai:testpass@postgres-test:5432/charai_test}"
: "${OPENTOPOGRAPHY_API_KEY:=keykey}"
: "${DEBUG:=True}"
: "${ALLOWED_HOSTS:=localhost,127.0.0.1,char-ai-frontend,192.168.254.31,192.168.254.100}"

docker build -t "$IMAGE" .

docker run -d \
        -e SECRET_KEY="$SECRET_KEY" \
        -e DATABASE_URL="$DATABASE_URL" \
        -e OPENTOPOGRAPHY_API_KEY="$OPENTOPOGRAPHY_API_KEY" \
        -e DEBUG="$DEBUG" \
        -e ALLOWED_HOSTS="$ALLOWED_HOSTS" \
        -p "$EXTERNAL_PORT":"$INTERNAL_PORT" --name "$IMAGE" "$IMAGE"
