#!/bin/bash

image=connext_card:latest

bash ops/build.sh

docker container stop connext_card 2> /dev/null || true
docker container prune -f

bash ops/deploy.sh
