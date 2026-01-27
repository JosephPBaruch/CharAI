#!/bin/bash 
IMAGE="char-ai-frontend"
INTERNAL_PORT=80
EXTERNAL_PORT=80

docker build -t $IMAGE .

# Want to change VITE_API_URL and/or VITE_APP_URL?
# Use the following commands to build custom environment variables:

# docker build \
#   --build-arg VITE_API_URL="http://localhost:8000/api" \
#   --build-arg VITE_APP_URL="http://localhost:80" \
#   -t $IMAGE .

docker run -d -p $EXTERNAL_PORT:$INTERNAL_PORT --name $IMAGE $IMAGE

