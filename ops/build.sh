#!/bin/bash

registry=docker.io/connextproject
image=connext_card:latest

rm .env
cp ops/prod.env .env

npm run build

docker build --file ops/prod.dockerfile --tag $image .

if [[ "$1" == "prod" ]]
then
  docker tag $image $registry/$image
  docker push  $registry/$image
fi

