# Card

A simple offchain wallet, hosted in the browser, which utilizes Indra payment channels. Inspired by the SpankCard and Austin Griffith's burner wallet.

See it on Rinkeby at: https://card.connext.network

Mainnet implementation: https://daicard.io (coming soon!)

## Overview

Developer note: for branch `get-hub-config` to be functional in production, the updates from indra branch `config-endpoint` need to be merged to master, deployed to prod, and have it's client changed published to npm.

## Local development

1. Make sure you have indra running locally. Check out the instructions at https://github.com/ConnextProject/indra

TL;DR:

```
git clone https://github.com/ConnextProject/indra.git
cd indra
npm start
```

2. Clone this repo and install dependencies

```
git clone https://github.com/ConnextProject/card.git
cd card
npm i
```

3. Start the app in developer-mode

```
npm start
```

4. Browse to localhost:3000

## To develop the connext client alongside 

```
# From the card repo, assuming indra has been cloned & started in the parent directory
cp -rf ../indra/modules/client connext
rm -rf node_modules/connext
ln -s ../connext node_modules/connext
# then restart local development according to the instructions above
```
