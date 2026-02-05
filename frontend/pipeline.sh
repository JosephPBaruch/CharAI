#!/usr/bin/env bash
set -e

usage() {
	echo "Usage: $0 [-i image] [-I internal_port] [-p external_port] [-a app_url] [-f env_file]"
	exit 1
}

IMAGE="char-ai-frontend"
INTERNAL_PORT=80
EXTERNAL_PORT=80
APP_URL="http://localhost"
ENV_FILE=""

while getopts ":i:I:p:a:f:h" opt; do
	case "${opt}" in
		i) IMAGE="$OPTARG" ;;
		I) INTERNAL_PORT="$OPTARG" ;;
		p) EXTERNAL_PORT="$OPTARG" ;;
		a) APP_URL="$OPTARG" ;;
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

: "${IMAGE:=char-ai-frontend}"
: "${INTERNAL_PORT:=80}"
: "${EXTERNAL_PORT:=80}"
: "${APP_URL:=http://localhost}"

docker build -t "$IMAGE" .

docker run -d -p "$EXTERNAL_PORT":"$INTERNAL_PORT" --name "$IMAGE" "$IMAGE"

