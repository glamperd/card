#!/usr/bin/env bash

prod_server=card.connext.network
ssh_key="$HOME/.ssh/connext-aws"

if [[ ! -f "$ssh_key" ]]
then echo "To deploy to $prod_server, you need to have an ssh key at: $ssh_key" && exit
fi

echo "Building a production-version of the app & pushing images to our container registry"
make prod
make push
if [[ "$?" != "0" ]]
then echo "Make sure you're logged into docker & have push permissions: docker login"
fi

echo;echo
echo "Preparing to re-deploy the in-production card app. Without running any tests. Good luck."
echo;echo
sleep 2 # Give the user one last chance to ctrl-c before we pull the trigger

ssh -i $ssh_key ubuntu@$prod_server "bash -c 'git clone https://github.com/ConnextProject/card.git 2> /dev/null || true'"

ssh -i $ssh_key ubuntu@$prod_server "bash -c 'cd card && git fetch && git reset --hard origin/master && bash ops/restart.sh prod'"
