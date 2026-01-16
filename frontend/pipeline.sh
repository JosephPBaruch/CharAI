#!/bin/bash 
IMAGE="char-ai-frontend"
INTERNAL_PORT=5173
EXTERNAL_PORT=5173

docker build -t $IMAGE .

docker run -d -p $EXPOSE_PORT:$INTERNAL_PORT --name $IMAGE $IMAGE