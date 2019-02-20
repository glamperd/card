#!/bin/bash

registry=docker.io/connextproject
image=connext_card:latest

docker build --file ops/builder.dockerfile --tag card_builder:latest .

my_id="`id -u`:`id -g`"
kernel="`uname`"
id=`if [[ "$kernel" == "Darwin" ]]; then echo 0:0; else echo $my_id; fi`

docker run --name="card_buidler" --tty --rm --volume="`pwd`:/root" card_builder $id "npm install --unsafe-perm --prefer-offline"

rm .env
cp ops/prod.env .env

docker run --name="card_buidler" --tty --rm --volume="`pwd`:/root" card_builder $id "npm run build"

docker build --file ops/prod.dockerfile --tag $image .

if [[ "$1" == "prod" ]]
then
  docker tag $image $registry/$image
  docker push  $registry/$image
fi

