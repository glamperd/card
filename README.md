# Card

A simple offchain wallet, hosted in the browser, which utilizes Indra payment channels. Inspired by the SpankCard and Austin Griffith's burner wallet.

See it on Rinkeby at: https://card.connext.network

Mainnet implementation: https://daicard.io (coming soon!)

## Overview

## Local development

1. Run Indra (the hub server) locally

Check out the instructions at https://github.com/ConnextProject/indra

TL;DR:

```
git clone https://github.com/ConnextProject/indra.git
cd indra
npm start
```

(You'll need to have both `make` and `docker` installed to run Indra)

2. Run the Dai Card locally in dev-mode

```
git clone https://github.com/ConnextProject/card.git
cd card
npm i
npm start
```

4. Browse to localhost:3000

## To develop the connext client alongside 

```
# From the card repo, assuming indra has been cloned & started in the parent directory
cp -rf ../indra/modules/client connext
rm -rf node_modules/connext
ln -s ../connext node_modules/connext
npm restart
```
