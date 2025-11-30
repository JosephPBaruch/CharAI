#!/bin/bash 

IMAGE="char-ai-frontend"

INTERNAL_PORT=5173

# Default environment file and mode
ENV_FILE="dev.env"
MODE="local" # local (npm run dev) | container (Docker)

usage() {
    cat <<'EOF'
Usage: ./pipeline.sh [options]

Options:
    -p            Use prod.env
    -d            Use dev.env (default)
    -c            Container mode (build/run Docker)
    -h, --help    Show this help and exit

Description:
    By default runs the frontend locally via 'npm run dev' after sourcing the selected env file.
    With -c, builds Docker image 'char-ai-frontend' and runs container mapping EXPOSE_PORT->5173.
    EXPOSE_PORT is read from the selected env file; defaults to 5173 if unset (container mode only).

Examples:
    ./pipeline.sh                # local dev with dev.env
    ./pipeline.sh -p             # local dev with prod.env
    ./pipeline.sh -c             # container mode with dev.env
    ./pipeline.sh -c -p          # container mode with prod.env
    ./pipeline.sh -d             # local dev with dev.env
    ./pipeline.sh --help
EOF
}

# Long option --help
if [[ "${1:-}" == "--help" ]]; then
    usage
    exit 0
fi

# Parse flags (-p production, -d development, -c container, -h help)
while getopts ":pdhc" opt; do
    case $opt in
        p)
            ENV_FILE="prod.env"
            ;;
        d)
            ENV_FILE="dev.env"
            ;;
        c)
            MODE="container"
            ;;
        h)
            usage
            exit 0
            ;;
        \?)
            echo "Invalid option: -$OPTARG" >&2
            usage
            exit 1
            ;;
    esac
done
shift $((OPTIND - 1))

# Load environment (used by both local and container modes)
if [ ! -f "$ENV_FILE" ]; then
    echo "Environment file '$ENV_FILE' not found." >&2
    exit 1
fi

echo "Loading environment from $ENV_FILE"
source "$ENV_FILE"

# Local mode: run npm dev and exit
if [ "$MODE" = "local" ]; then
    if [ ! -f package.json ]; then
        echo "package.json not found in current directory." >&2
        exit 1
    fi
    echo "Starting local development server (npm run dev)..."
    npm run dev
    exit $?
fi

# Fallback if EXPOSE_PORT not set in env file (container mode only)
: "${EXPOSE_PORT:=5173}"

# Stop and remove existing container if it exists
if [ "$(docker ps -q -f name=$IMAGE)" ]; then
    echo "Stopping and removing existing $IMAGE container..."
    docker stop $IMAGE
    docker rm $IMAGE
fi

# Remove existing image if it exists
if [ "$(docker images -q $IMAGE)" ]; then
    echo "Removing existing $IMAGE image..."
    docker rmi $IMAGE
fi

# Build the new Docker image
echo "Building the new $IMAGE Docker image..."
docker build -t $IMAGE .

# Run the new Docker container
echo "Running the new $IMAGE Docker container..."
docker run -d -p $EXPOSE_PORT:$INTERNAL_PORT --name $IMAGE $IMAGE