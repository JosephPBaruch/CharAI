#!/usr/bin/env bash
set -e

usage() {
    echo "Usage: $0 [-d dbname] [-u user] [-p password] [-n network] [-c container_name] [-i image] [-f env_file]"
    exit 1
}

POSTGRES_DB="charai_test"
POSTGRES_USER="charai"
POSTGRES_PASSWORD="testpass"
NETWORK="charai-net"
CONTAINER_NAME="postgres-test"
IMAGE="postgres:16-alpine"
ENV_FILE=""

while getopts ":d:u:p:n:c:i:f:h" opt; do
    case "${opt}" in
        d) POSTGRES_DB="$OPTARG" ;;
        u) POSTGRES_USER="$OPTARG" ;;
        p) POSTGRES_PASSWORD="$OPTARG" ;;
        n) NETWORK="$OPTARG" ;;
        c) CONTAINER_NAME="$OPTARG" ;;
        i) IMAGE="$OPTARG" ;;
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

: "${POSTGRES_DB:=charai_test}"
: "${POSTGRES_USER:=charai}"
: "${POSTGRES_PASSWORD:=testpass}"
: "${NETWORK:=charai-net}"
: "${CONTAINER_NAME:=postgres-test}"
: "${IMAGE:=postgres:16-alpine}"

docker run -d \
        -e POSTGRES_DB="$POSTGRES_DB" \
        -e POSTGRES_USER="$POSTGRES_USER" \
        -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
        --network "$NETWORK" \
        --name "$CONTAINER_NAME" \
        "$IMAGE"