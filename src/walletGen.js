import { store } from "./App";
// import * as ethers from "ethers";
const bip39 = require("bip39");
const hdkey = require("ethereumjs-wallet/hdkey");

export async function createWallet(web3) {
  const mnemonic = bip39.generateMnemonic();
  const seed = bip39.mnemonicToSeed(mnemonic);
  const wallet = await hdkey
    .fromMasterSeed(seed)
    .derivePath("m/44'/60'/0'/0/0")
    .getWallet();
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

export async function createWalletFromMnemonic(mnemonic) {
  let wallet;
  try {
    const seed = bip39.mnemonicToSeed(mnemonic);
    wallet = await hdkey
      .fromMasterSeed(seed)
      .derivePath("m/44'/60'/0'/0/0")
      .getWallet();

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
    console.log(`error in WalletGen`);
    console.log(e);
  }
}

export function getStore() {
  if (store) {
    return store;
  } else {
    console.log("no store found");
  }
}
