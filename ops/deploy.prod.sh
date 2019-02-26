#!/bin/bash

project="daicard"
number_of_services=2
image=docker.io/connextproject/daicard:latest

if [[ -n "$DOMAINNAME" ]] 
then DOMAINNAME=$DOMAINNAME
else DOMAINNAME=localhost
fi

if [[ -n "$EMAIL" ]] 
then EMAIL=$EMAIL
else EMAIL=noreply@gmail.com
fi

docker pull $image

mkdir -p /tmp/$project
cat - > /tmp/$project/docker-compose.yml <<EOF
version: '3.4'
volumes:
  certs:
services:
  proxy:
    image: $proxy_image
    environment:
      DOMAINNAME: $DOMAINNAME
      EMAIL: $EMAIL
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - certs:/etc/letsencrypt
EOF

docker stack deploy -c /tmp/$project/docker-compose.yml $project
rm -rf /tmp/$project

echo -n "Waiting for the $project stack to wake up."
while true
do
  num_awake="`docker container ls | grep $project | wc -l | sed 's/ //g'`"
  sleep 3
  if [[ "$num_awake" == "$number_of_services" ]]
  then break
  else echo -n "."
  fi
done
echo " Good Morning!"
sleep 3

