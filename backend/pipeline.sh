#!/usr/bin/env bash
set -e

IMAGE="char-ai-frontend"
INTERNAL_PORT=8000
EXTERNAL_PORT=8000

docker build -t $IMAGE .

docker run -d -p $EXTERNAL_PORT:$INTERNAL_PORT --name $IMAGE $IMAGE

