#!/bin/bash

docker run -d \
    -e POSTGRES_DB=charai_test \
    -e POSTGRES_USER=charai \
    -e POSTGRES_PASSWORD=testpass \
    --network charai-net \
    --name postgres-test \
    postgres:16-alpine