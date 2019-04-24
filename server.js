require("babel-core/register");
//require("./src/config.es6");
//TODO - Put this in networking.ts
global.fetch = require('node-fetch');
global.document = {};
require('dotenv').config()

var start = require('./lib/App.js').start;
start();
console.log('App instantiated');
