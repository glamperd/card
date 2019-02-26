#!/bin/bash

project="daicard"
number_of_services=1
version="`cat package.json | grep '"version":' | egrep -o '[.0-9]+'`"

if [[ -n "$DOMAINNAME" ]] 
then DOMAINNAME=$DOMAINNAME
else DOMAINNAME=localhost
fi

if [[ -n "$EMAIL" ]] 
then EMAIL=$EMAIL
else EMAIL=noreply@gmail.com
fi

if [[ "$DOMAINNAME" == "localhost" ]]
then image=daicard:latest
else
  if [[ "$MODE" == "live" ]]
  then image=docker.io/connextproject/daicard:$version
  else image=docker.io/connextproject/daicard:latest
  fi
  docker pull $image
fi

echo "Deploying image: $image"

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

