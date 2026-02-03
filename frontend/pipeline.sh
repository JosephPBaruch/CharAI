#!/bin/bash 
set -e

IMAGE="char-ai-frontend"
INTERNAL_PORT=80
EXTERNAL_PORT=80
APP_URL="http://localhost"

docker build -t $IMAGE .

docker run -d -p $EXTERNAL_PORT:$INTERNAL_PORT --name $IMAGE $IMAGE

