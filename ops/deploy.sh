#!/bin/bash

DOMAINNAME=$DOMAINNAME; [[ -n "$DOMAINNAME" ]] || DOMAINNAME=localhost
EMAIL=$EMAIL; [[ -n "$EMAIL" ]] || EMAIL=noreply@gmail.com

docker container run \
  --name "connext_card" \
  --detach \
  --env DOMAINNAME=$DOMAINNAME \
  --env EMAIL=$EMAIL \
  --publish "80:80" \
  --publish "443:443" \
  --volume card_certs:/etc/letsencrypt \
  connext_card:latest
