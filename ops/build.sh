#!/bin/bash

image=connext_card:latest

rm .env
cp ops/prod.env .env

npm run build

docker build --file ops/prod.dockerfile --tag $image .

