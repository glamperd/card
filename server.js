require("babel-core/register");
//require("./src/config.es6");

var app = require('./lib/App.js');
app.init();
console.log('App instantiated');
