#!/usr/bin/env bash
set -e

IMAGE="char-ai-backend"
INTERNAL_PORT=8000
EXTERNAL_PORT=8000

docker build -t $IMAGE .

docker run -d \
    -e DATABASE_URL=postgresql://charai:testpass@postgres-test:5432/charai_test \
    -e OPENTOPOGRAPHY_API_KEY=keykey \
    -e ALLOWED_HOSTS=localhost,127.0.0.1,char-ai-frontend \
    -p $EXTERNAL_PORT:$INTERNAL_PORT --name $IMAGE $IMAGE
