#!/bin/bash

prod_server=card.connext.network
pk_file="$HOME/.ssh/connext-aws"

if [[ ! -f "$pk_file" ]]
then echo "You need to have an ssh with path $pk_file to deploy to the production server" && exit
fi

echo "Rebuilding a production-version of the app & pushing images to our container registry"
bash ops/build.sh prod

echo;echo
echo "Preparing to re-deploy the in-production card app. Without running any tests. Good luck."
echo;echo
sleep 2 # Give the user one more chance to ctrl-c before we pull the trigger

ssh -i $pk_file ubuntu@$prod_server "bash -c 'git clone https://github.com/ConnextProject/card.git 2> /dev/null || true'"

ssh -i $pk_file ubuntu@$prod_server "bash -c 'cd card && git fetch && git reset --hard origin/master && bash ops/restart.sh prod'"
