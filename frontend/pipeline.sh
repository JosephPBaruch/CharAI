#!/bin/bash 
IMAGE="char-ai-frontend"
INTERNAL_PORT=5173
EXTERNAL_PORT=5173

docker build -t $IMAGE .

docker run -d -p $EXTERNAL_PORT:$INTERNAL_PORT --name $IMAGE $IMAGE

# Want to change VITE_API_URL and/or VITE_APP_URL?
# Use the following commands to build custom environment variables: 

# docker build \
#   --build-arg VITE_API_URL="http://localhost:8000/api" \
#   --build-arg VITE_APP_URL="http://localhost:5173" \
#   -t charai-frontend .

