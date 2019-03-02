#!/usr/bin/env bash
set -e

user=ubuntu
prod_server=daicard.io
ssh_key="$HOME/.ssh/connext-aws"

if [[ ! -f "$ssh_key" ]]
then echo "To deploy to $prod_server, you need to have an ssh key at: $ssh_key" && exit
fi

echo "Rebuilding a production-version of the app & pushing images to our container registry"
make prod
make push
if [[ "$?" != "0" ]]
then echo "Make sure you're logged into docker & have push permissions: docker login"
fi

# Make sure the prod server has the card repo available
ssh -i $ssh_key $user@$prod_server "bash -c 'git clone https://github.com/ConnextProject/card.git 2> /dev/null || true'"

# Make sure the prod server's repo is up to date with master
ssh -i $ssh_key $user@$prod_server "bash -c 'cd card && git fetch && git reset --hard origin/master'"

echo;echo
echo "Preparing to re-deploy the card app to $prod_server. Without running any tests. Good luck."
echo;echo
sleep 2 # Give the user one last chance to ctrl-c before we pull the trigger

# Deploy!
ssh -i $ssh_key $user@$prod_server "bash -c 'cd card && DOMAINNAME=$prod_server bash ops/restart.sh prod'"
