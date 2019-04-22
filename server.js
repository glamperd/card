require("babel-core/register");
//require("./src/config.es6");

var start = require('./lib/App.js').start;
//var app = new App();
//console.log(app)
start();
console.log('App instantiated');
