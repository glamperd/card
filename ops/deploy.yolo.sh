#!/usr/bin/env bash
set -e

function makePrompt {
  prompt=$1

  read -p "$prompt (y/n) " -n 1 -r
  echo    # (optional) move to a new line
  if [[ ! $REPLY =~ ^[Yy]$ ]]
  then
      echo "Exiting."
      exit # handle exits from shell or function but don't exit interactive shell
  fi
}

MODE="${1:-staging}"
if [[ "$MODE" == "prod" ]]
then prod_server="daicard.io"
else prod_server="staging.connext.network"
fi

user=ubuntu
ssh_key="$HOME/.ssh/connext-aws"

if [[ ! -f "$ssh_key" ]]
then echo "To deploy to $prod_server, you need to have an ssh key at: $ssh_key" && exit
fi

echo "Deploying to server at: $prod_server"
echo "Before yolo deploying the card, let's go through a small checklist. Did you test all of the following flows:"

makePrompt "User depositing eth?"
makePrompt "User getting refunded eth deposit to browser wallet?"
makePrompt "User depositing below the minimum eth?"
makePrompt "User depositing tokens?"
makePrompt "User making payments to collateralized and uncollateralized channels?"
makePrompt "User redeeming payments?" 
makePrompt "User receiving payments? (collateralized? near maximum? above maximum collateral? multiple?)"
makePrompt "User withdrawing?"
makePrompt "Did you try faulty inputs in these flows? (large payments, non-addresses, etc)"
makePrompt "Did you test this on Brave, Firefox, Chrome, and Safari? Or at least more than one of them?"
makePrompt "If these are big changes, did more than 1 person perform these tests?"

echo
makePrompt "Are you sure you want to deploy without any additional testing?"

echo;echo "Rebuilding a production-version of the app & pushing images to our container registry"
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