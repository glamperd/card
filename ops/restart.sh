#!/bin/bash

docker container stop connext_card 2> /dev/null || true
docker container prune -f

bash ops/start.sh $1
