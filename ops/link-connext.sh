#!/usr/bin/env bash

external_client="../indra/modules/client"

if [[ ! -d "$external_client" ]]
then echo "Error, couldn't find client to link at $external_client" && exit
fi

echo "rm -rf connext"
rm -rf connext

echo "cp -rf ../indra/modules/client connext"
cp -rf ../indra/modules/client connext

echo "rm -rf node_modules/connext"
rm -rf node_modules/connext

echo "ln -s ../connext node_modules/connext"
ln -s ../connext node_modules/connext

echo "rebuilding the client..."
cd connext && npm run build

echo "Done!"

