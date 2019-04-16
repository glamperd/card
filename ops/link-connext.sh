#!/usr/bin/env bash
set -e

external_client="../indra/modules/client"

if [[ ! -d "$external_client" ]]
then echo "Error, couldn't find client to link at $external_client" && exit
fi

echo "rm -rf connext"
rm -rf connext

echo "cp -rf ../indra/modules/client connext"
cp -rf ../indra/modules/client connext

echo "rebuilding the client..."
cd connext
npm run build
cd ..

echo "rm -rf node_modules/connext/dist"
rm -rf node_modules/connext/dist

echo "cp -r connext/dist node_modules/connext/dist"
cp -r connext/dist node_modules/connext/dist

echo "Done!"

# NOTE: You might want to replace line 80 of:
# node_modules/react-scripts/config/webpackDevServer.config.js
# with:
# ignored: [/node_modules\/(?!connext)/,/connext\/node_modules/], poll: 1000
# (Thanks: https://stackoverflow.com/a/44166532)
