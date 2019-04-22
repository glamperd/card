"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createWallet = createWallet;
exports.createWalletFromMnemonic = createWalletFromMnemonic;
exports.getStore = getStore;

var _App = require("./App");

// import * as ethers from "ethers";
var bip39 = require("bip39");
var hdkey = require("ethereumjs-wallet/hdkey");

async function createWallet(web3) {
  var mnemonic = bip39.generateMnemonic();
  var seed = bip39.mnemonicToSeed(mnemonic);
  var wallet = await hdkey.fromMasterSeed(seed).derivePath("m/44'/60'/0'/0/0").getWallet();
  // const wallet = await web3.eth.accounts.create()

  //TODO - avoid localStorage
  /*
  localStorage.setItem("delegateSigner", wallet.getAddressString());
  localStorage.setItem("mnemonic", mnemonic);
  localStorage.setItem("privateKey", wallet.getPrivateKeyString());
    // update refunding variable on burn
  localStorage.removeItem("refunding");
  localStorage.removeItem("maxBalanceAfterRefund");
    // also force to go through tutorial on each new
  // wallet creation
  localStorage.removeItem("hasBeenWarned");
  */
  return wallet;
}

async function createWalletFromMnemonic(mnemonic) {
  var wallet = void 0;
  try {
    var seed = bip39.mnemonicToSeed(mnemonic);
    wallet = await hdkey.fromMasterSeed(seed).derivePath("m/44'/60'/0'/0/0").getWallet();

    //TODO - avoid localStorage
    /*
    localStorage.setItem("delegateSigner", wallet.getAddressString());
    localStorage.setItem("mnemonic", mnemonic);
    localStorage.setItem("privateKey", wallet.getPrivateKeyString());
    // update refunding variable on import
    localStorage.removeItem("refunding");
    localStorage.removeItem("maxBalanceAfterRefund");
    */
    return wallet;
  } catch (e) {
    console.log("error in WalletGen");
    console.log(e);
  }
}

function getStore() {
  if (_App.store) {
    return _App.store;
  } else {
    console.log("no store found");
  }
}