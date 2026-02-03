#!/usr/bin/env bash
set -e

IMAGE="char-ai-backend"
INTERNAL_PORT=8000
EXTERNAL_PORT=8000

docker build -t $IMAGE .

docker run -d \
    -e SECRET_KEY=supersecretkey \
    -e DATABASE_URL=postgresql://charai:testpass@postgres-test:5432/charai_test \
    -e OPENTOPOGRAPHY_API_KEY=keykey \
    -e DEBUG=True \
    -e ALLOWED_HOSTS=localhost,127.0.0.1,char-ai-frontend,192.168.254.31,192.168.254.100 \
    -p $EXTERNAL_PORT:$INTERNAL_PORT --name $IMAGE $IMAGE
