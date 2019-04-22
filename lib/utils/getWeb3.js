"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _web = require("web3");

var _web2 = _interopRequireDefault(_web);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getWeb3 = function getWeb3() {
  return new Promise(function (resolve, reject) {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener("load", function () {
      var web3 = window.web3;

      // Checking if Web3 has been injected by the browser (Mist/MetaMask).
      var alreadyInjected = typeof web3 !== "undefined";

      if (alreadyInjected) {
        // Use Mist/MetaMask's provider.
        web3 = new _web2.default(web3.currentProvider);
        resolve(web3);
      } else {
        // Fallback to localhost if no web3 injection. We've configured this to
        // use the development console's port by default.
        var provider = new _web2.default.providers.HttpProvider("http://127.0.0.1:8545");
        web3 = new _web2.default(provider);
        console.log("No web3 instance injected, using local web3.");
        resolve(web3);
      }
    });
  });
};

exports.default = getWeb3;