"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.store = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //import React, { Fragment } from "react";
//import "./App.css";

//import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
//import Home from "./components/Home";
//import DepositCard from "./components/depositCard";

//import { Paper, withStyles, Button, Grid } from "@material-ui/core";
//import AppBarComponent from "./components/AppBar";
//import SettingsCard from "./components/settingsCard";
//import ReceiveCard from "./components/receiveCard";
//import SendCard from "./components/sendCard";
//import CashOutCard from "./components/cashOutCard";
///import SupportCard from "./components/supportCard";

//import RedeemCard from "./components/redeemCard";
//import SetupCard from "./components/setupCard";
//import Confirmations from "./components/Confirmations";

//import Snackbar from "./components/snackBar";


var _actions = require("./utils/actions.js");

var _redux = require("redux");

var _Connext = require("connext/dist/Connext.js");

var _ProviderOptions = require("./utils/ProviderOptions.ts");

var _ProviderOptions2 = _interopRequireDefault(_ProviderOptions);

var _clientProvider = require("./utils/web3/clientProvider.ts");

var _clientProvider2 = _interopRequireDefault(_clientProvider);

var _walletGen = require("./walletGen");

var _axios = require("axios");

var _axios2 = _interopRequireDefault(_axios);

var _bignumber = require("bignumber.js");

var _bignumber2 = _interopRequireDefault(_bignumber);

var _CurrencyTypes = require("connext/dist/state/ConnextState/CurrencyTypes");

var _CurrencyConvertable = require("connext/dist/lib/currency/CurrencyConvertable");

var _CurrencyConvertable2 = _interopRequireDefault(_CurrencyConvertable);

var _getExchangeRates = require("connext/dist/lib/getExchangeRates");

var _getExchangeRates2 = _interopRequireDefault(_getExchangeRates);

var _intervalPromise = require("interval-promise");

var _intervalPromise2 = _interopRequireDefault(_intervalPromise);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//const tmp = fs.readFileSync('.store')
//console.log(tmp)

var store = exports.store = (0, _redux.createStore)(_actions.setWallet, null);

var publicUrl = void 0;

var Web3 = require("web3");
var eth = require("ethers");
var humanTokenAbi = require("./abi/humanToken.json");

var env = process.env.NODE_ENV;
var tokenAbi = humanTokenAbi;

var overrides = {
  localHub: process.env.REACT_APP_LOCAL_HUB_OVERRIDE,
  localEth: process.env.REACT_APP_LOCAL_ETH_OVERRIDE,
  rinkebyHub: process.env.REACT_APP_RINKEBY_HUB_OVERRIDE,
  rinkebyEth: process.env.REACT_APP_RINKEBY_ETH_OVERRIDE,
  ropstenHub: process.env.REACT_APP_ROPSTEN_HUB_OVERRIDE,
  ropstenEth: process.env.REACT_APP_ROPSTEN_ETH_OVERRIDE,
  mainnetHub: process.env.REACT_APP_MAINNET_HUB_OVERRIDE,
  mainnetEth: process.env.REACT_APP_MAINNET_ETH_OVERRIDE
};

var DEPOSIT_ESTIMATED_GAS = new _bignumber2.default("700000"); // 700k gas
//const DEPOSIT_MINIMUM_WEI = new BigNumber(Web3.utils.toWei("0.020", "ether")); // 30 FIN
var HUB_EXCHANGE_CEILING = new _bignumber2.default(Web3.utils.toWei("69", "ether")); // 69 TST
var CHANNEL_DEPOSIT_MAX = new _bignumber2.default(Web3.utils.toWei("30", "ether")); // 30 TST
var HASH_PREAMBLE = "SpankWallet authentication message:";

var App = function () {
  function App(props) {
    _classCallCheck(this, App);

    //super(props);
    this.state = {
      loadingConnext: true,
      rpcUrl: null,
      hubUrl: null,
      tokenAddress: null,
      channelManagerAddress: null,
      hubWalletAddress: null,
      web3: null,
      customWeb3: null,
      tokenContract: null,
      connext: null,
      delegateSigner: null,
      modals: {
        settings: false,
        keyGen: false,
        receive: false,
        send: false,
        cashOut: false,
        scan: false,
        deposit: false
      },
      authorized: "false",
      approvalWeiUser: "10000",
      channelState: null,
      exchangeRate: "0.00",
      interval: null,
      connextState: null,
      runtime: null,
      sendScanArgs: {
        amount: null,
        recipient: null
      },
      address: "",
      status: {
        deposit: "",
        withdraw: "",
        payment: "",
        hasRefund: ""
      },
      browserMinimumBalance: null
    };

    this.networkHandler = this.networkHandler.bind(this);
  }

  // ************************************************* //
  //                     Hooks                         //
  // ************************************************* //

  _createClass(App, [{
    key: "componentDidMount",
    value: async function componentDidMount() {
      // set public url
      publicUrl = 'localhost'; //window.location.origin.toLowerCase();
      console.log(publicUrl);

      // Set up state
      var mnemonic = localStorage.getItem("mnemonic");
      // on mount, check if you need to refund by removing maxBalance
      localStorage.removeItem("refunding");
      var rpc = localStorage.getItem("rpc-prod");
      // TODO: better way to set default provider
      // if it doesnt exist in storage
      if (!rpc) {
        rpc = env === "development" ? "LOCALHOST" : "MAINNET";
        localStorage.setItem("rpc-prod", rpc);
      }
      // If a browser address exists, create wallet
      if (mnemonic) {
        var delegateSigner = await (0, _walletGen.createWalletFromMnemonic)(mnemonic);
        var address = await delegateSigner.getAddressString();
        this.setState({ delegateSigner: delegateSigner, address: address });
        store.dispatch({
          type: "SET_WALLET",
          text: delegateSigner
        });

        await this.setWeb3(rpc);
        await this.setConnext();
        await this.setTokenContract();

        await this.pollConnextState();
        await this.setBrowserWalletMinimumBalance();
        await this.poller();
      } else {
        // Else, we create a new address
        var _delegateSigner = await (0, _walletGen.createWallet)(this.state.web3);
        var _address = await _delegateSigner.getAddressString();
        this.setState({ delegateSigner: _delegateSigner, address: _address });
        store.dispatch({
          type: "SET_WALLET",
          text: _delegateSigner
        });
        // Then refresh the page
        //window.location.reload();
      }

      // Initialise authorisation
      await this.authorizeHandler();
    }
  }, {
    key: "init",
    value: async function init() {

      var fs = require('fs');
      //console.log('fs', fs)
      //const path = require('path')
      //console.log('init', __dirname, '...', './')
      var storeFile = "/.store";
      //console.log('storeFile ', storeFile)
      //console.log(await fs.readdirSync(storeFile))

      // Set up state
      var data;
      var fileStore;
      try {
        data = fs.readFileSync(storeFile, 'utf8');
        console.log(data);
        //console.log('store data', JSON.parse(data))
        fileStore = new Map(JSON.parse(data));
      } catch (err) {
        fileStore = new Map();
        fileStore["mnemonic"] = "history rotate stem become spider barrel grant valley rather era ecology aerobic";
        fileStore["delegateSigner"] = {
          "_privKey": { "type": "Buffer", "data": [185, 161, 76, 249, 112, 89, 29, 27, 204, 95, 82, 48, 27, 1, 176, 244, 57, 37, 231, 108, 94, 49, 61, 133, 166, 154, 152, 18, 107, 14, 173, 171] },
          "_pubKey": { "type": "Buffer", "data": [30, 53, 227, 38, 40, 0, 130, 1, 99, 192, 66, 22, 179, 163, 56, 144, 8, 2, 152, 30, 214, 94, 187, 245, 141, 18, 38, 248, 190, 214, 30, 232, 128, 113, 51, 180, 107, 37, 241, 139, 62, 185, 26, 92, 13, 87, 238, 129, 58, 156, 42, 68, 127, 10, 109, 181, 15, 132, 158, 153, 162, 232, 223, 159] }
        };
        fileStore["address"] = "0xb4ddd08d5348ddb48263347a388b1896a7ab0527";
      }

      // Set up state
      var mnemonic = fileStore.getItem("mnemonic");
      // on mount, check if you need to refund by removing maxBalance
      fileStore.delete("refunding");
      var rpc = fileStore.getItem("rpc-prod");
      // TODO: better way to set default provider
      // if it doesnt exist in storage
      if (!rpc) {
        rpc = env === "development" ? "LOCALHOST" : "MAINNET";
        fileStore.setItem("rpc-prod", rpc);
      }
      // If a browser address exists, create wallet
      if (mnemonic) {
        var delegateSigner = await (0, _walletGen.createWalletFromMnemonic)(mnemonic);
        var address = await delegateSigner.getAddressString();
        this.setState({ delegateSigner: delegateSigner, address: address });
        fileStore.dispatch({
          type: "SET_WALLET",
          text: delegateSigner
        });

        await this.setWeb3(rpc);
        await this.setConnext();
        await this.setTokenContract();

        await this.pollConnextState();
        await this.setBrowserWalletMinimumBalance();
        await this.poller();
      } else {
        // Else, we create a new address
        var _delegateSigner2 = await (0, _walletGen.createWallet)(this.state.web3);
        var _address2 = await _delegateSigner2.getAddressString();
        this.setState({ delegateSigner: _delegateSigner2, address: _address2 });
        fileStore.dispatch({
          type: "SET_WALLET",
          text: _delegateSigner2
        });
        // Then refresh the page
        //window.location.reload();
      }
    }

    // ************************************************* //
    //                State setters                      //
    // ************************************************* //

  }, {
    key: "networkHandler",
    value: async function networkHandler(rpc) {
      // called from settingsCard when a new RPC URL is connected
      // will refresh the page after
      localStorage.setItem("rpc-prod", rpc);
      // update refunding variable on rpc switch
      localStorage.removeItem("maxBalanceAfterRefund");
      localStorage.removeItem("refunding");
      // await this.setWeb3(rpc);
      // await this.setConnext();
      // await this.setTokenContract();
      window.location.reload();
      return;
    }

    // either LOCALHOST MAINNET or RINKEBY

  }, {
    key: "setWeb3",
    value: async function setWeb3(rpc) {
      var rpcUrl = void 0,
          hubUrl = void 0;
      switch (rpc) {
        case "LOCALHOST":
          rpcUrl = overrides.localEth || publicUrl + "/api/local/eth";
          hubUrl = overrides.localHub || publicUrl + "/api/local/hub";
          break;
        case "RINKEBY":
          rpcUrl = overrides.rinkebyEth || publicUrl + "/api/rinkeby/eth";
          hubUrl = overrides.rinkebyHub || publicUrl + "/api/rinkeby/hub";
          break;
        case "ROPSTEN":
          rpcUrl = overrides.ropstenEth || publicUrl + "/api/ropsten/eth";
          hubUrl = overrides.ropstenHub || publicUrl + "/api/ropsten/hub";
          break;
        case "MAINNET":
          rpcUrl = overrides.mainnetEth || publicUrl + "/api/mainnet/eth";
          hubUrl = overrides.mainnetHub || publicUrl + "/api/mainnet/hub";
          break;
        default:
          throw new Error("Unrecognized rpc: " + rpc);
      }

      // Ask permission to view accounts
      var windowId = void 0;
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        windowId = await window.web3.eth.net.getId();
      }

      var providerOpts = new _ProviderOptions2.default(store, rpcUrl, hubUrl).approving();
      var provider = (0, _clientProvider2.default)(providerOpts);
      var customWeb3 = new Web3(provider);
      var customId = await customWeb3.eth.net.getId();
      // NOTE: token/contract/hubWallet ddresses are set to state while initializing connext
      this.setState({ customWeb3: customWeb3, hubUrl: hubUrl, rpcUrl: rpcUrl });
      if (windowId && windowId !== customId) {
        alert("Your card is set to " + JSON.stringify(rpc) + ". To avoid losing funds, please make sure your metamask and card are using the same network.");
      }
      return;
    }
  }, {
    key: "setTokenContract",
    value: async function setTokenContract() {
      try {
        var _state = this.state,
            customWeb3 = _state.customWeb3,
            tokenAddress = _state.tokenAddress;

        var tokenContract = new customWeb3.eth.Contract(tokenAbi, tokenAddress);
        this.setState({ tokenContract: tokenContract });
      } catch (e) {
        console.log("Error setting token contract");
        console.log(e);
      }
    }
  }, {
    key: "setConnext",
    value: async function setConnext() {
      var _state2 = this.state,
          address = _state2.address,
          customWeb3 = _state2.customWeb3,
          hubUrl = _state2.hubUrl;


      var opts = {
        web3: customWeb3,
        hubUrl: hubUrl, // in dev-mode: http://localhost:8080,
        user: address,
        origin: "localhost" // TODO: what should this be
      };

      // *** Instantiate the connext client ***
      console.log('getting Connext client', opts);
      var connext = await (0, _Connext.getConnextClient)(opts);
      console.log("Successfully set up connext! Connext config:");
      console.log("  - tokenAddress: " + connext.opts.tokenAddress);
      console.log("  - hubAddress: " + connext.opts.hubAddress);
      console.log("  - contractAddress: " + connext.opts.contractAddress);
      console.log("  - ethNetworkId: " + connext.opts.ethNetworkId);
      this.setState({
        connext: connext,
        tokenAddress: connext.opts.tokenAddress,
        channelManagerAddress: connext.opts.contractAddress,
        hubWalletAddress: connext.opts.hubAddress,
        ethNetworkId: connext.opts.ethNetworkId
      });
    }

    // ************************************************* //
    //                    Pollers                        //
    // ************************************************* //

  }, {
    key: "pollConnextState",
    value: async function pollConnextState() {
      var _this = this;

      var connext = this.state.connext;
      // register listeners
      connext.on("onStateChange", function (state) {
        console.log("Connext state changed:", state);
        _this.setState({
          channelState: state.persistent.channel,
          connextState: state,
          runtime: state.runtime,
          exchangeRate: state.runtime.exchangeRate ? state.runtime.exchangeRate.rates.USD : 0
        });
      });
      // start polling
      await connext.start();
      this.setState({ loadingConnext: false });
    }
  }, {
    key: "poller",
    value: async function poller() {
      var _this2 = this;

      await this.autoDeposit();
      await this.autoSwap();

      (0, _intervalPromise2.default)(async function (iteration, stop) {
        await _this2.autoDeposit();
      }, 5000);

      (0, _intervalPromise2.default)(async function (iteration, stop) {
        await _this2.autoSwap();
      }, 1000);

      (0, _intervalPromise2.default)(async function (iteration, stop) {
        await _this2.checkStatus();
      }, 400);

      (0, _intervalPromise2.default)(async function (iteration, stop) {
        await _this2.getCustodialBalance();
      }, 5000);
    }
  }, {
    key: "setBrowserWalletMinimumBalance",
    value: async function setBrowserWalletMinimumBalance() {
      var _state3 = this.state,
          customWeb3 = _state3.customWeb3,
          connextState = _state3.connextState;

      if (!customWeb3 || !connextState) {
        return;
      }
      var defaultGas = new _bignumber2.default((await customWeb3.eth.getGasPrice()));
      // default connext multiple is 1.5, leave 2x for safety
      var depositGasPrice = DEPOSIT_ESTIMATED_GAS.multipliedBy(new _bignumber2.default(2)).multipliedBy(defaultGas);
      // add dai conversion
      var minConvertable = new _CurrencyConvertable2.default(_CurrencyTypes.CurrencyType.WEI, depositGasPrice, function () {
        return (0, _getExchangeRates2.default)(connextState);
      });
      var browserMinimumBalance = {
        wei: minConvertable.toWEI().amount,
        dai: minConvertable.toUSD().amount
      };
      this.setState({ browserMinimumBalance: browserMinimumBalance });
      return browserMinimumBalance;
    }
  }, {
    key: "autoDeposit",
    value: async function autoDeposit() {
      var _state4 = this.state,
          address = _state4.address,
          tokenContract = _state4.tokenContract,
          connextState = _state4.connextState,
          tokenAddress = _state4.tokenAddress,
          exchangeRate = _state4.exchangeRate,
          channelState = _state4.channelState,
          rpcUrl = _state4.rpcUrl,
          browserMinimumBalance = _state4.browserMinimumBalance;

      if (!rpcUrl) {
        return;
      }

      if (!browserMinimumBalance) {
        return;
      }

      var web3 = new Web3(rpcUrl);
      var balance = await web3.eth.getBalance(address);

      var refunding = localStorage.getItem("refunding");
      if (refunding) {
        return;
      }

      var maxBalanceAfterRefund = localStorage.getItem("maxBalanceAfterRefund");
      if (maxBalanceAfterRefund && new _bignumber2.default(balance).gte(new _bignumber2.default(maxBalanceAfterRefund))) {
        // wallet balance hasnt changed since submitting tx, returning
        return;
      } else {
        // tx has been submitted, delete the maxWalletBalance from storage
        localStorage.removeItem("refunding");
        localStorage.removeItem("maxBalanceAfterRefund");
      }

      var tokenBalance = "0";
      try {
        tokenBalance = await tokenContract.methods.balanceOf(address).call();
      } catch (e) {
        console.warn("Error fetching token balance, are you sure the token address (addr: " + tokenAddress + ") is correct for the selected network (id: " + (await web3.eth.net.getId()) + "))? Error: " + e.message);
      }

      if (balance !== "0" || tokenBalance !== "0") {
        var minWei = new _bignumber2.default(browserMinimumBalance.wei);
        if (new _bignumber2.default(balance).lt(minWei)) {
          // don't autodeposit anything under the threshold
          // update the refunding variable before returning
          return;
        }
        // only proceed with deposit request if you can deposit
        if (!connextState || !connextState.runtime.canDeposit || exchangeRate === "0.00") {
          return;
        }

        // if you already have the maximum balance tokens hub will exchange
        // do not deposit any more eth to be swapped
        // TODO: figure out rounding error
        if (eth.utils.bigNumberify(channelState.balanceTokenUser).gte(eth.utils.parseEther("29.8"))) {
          // refund any wei that is in the browser wallet
          // above the minimum
          var refundWei = _bignumber2.default.max(new _bignumber2.default(balance).minus(minWei), 0);
          await this.returnWei(refundWei.toFixed(0));
          return;
        }

        var channelDeposit = {
          amountWei: new _bignumber2.default(balance).minus(minWei).toFixed(0),
          amountToken: tokenBalance
        };

        if (channelDeposit.amountWei === "0" && channelDeposit.amountToken === "0") {
          return;
        }

        // if amount to deposit into channel is over the channel max
        // then return excess deposit to the sending account
        var weiToReturn = this.calculateWeiToRefund(channelDeposit.amountWei, connextState);

        // return wei to sender
        if (weiToReturn !== "0") {
          await this.returnWei(weiToReturn);
          return;
        }
        // update channel deposit
        var weiDeposit = new _bignumber2.default(channelDeposit.amountWei).minus(new _bignumber2.default(weiToReturn));
        channelDeposit.amountWei = weiDeposit.toFixed(0);

        await this.state.connext.deposit(channelDeposit);
      }
    }
  }, {
    key: "returnWei",
    value: async function returnWei(wei) {
      var _state5 = this.state,
          address = _state5.address,
          customWeb3 = _state5.customWeb3;

      localStorage.setItem("refunding", Web3.utils.fromWei(wei, "finney"));

      if (!customWeb3) {
        return;
      }

      // if wei is 0, save gas and return
      if (wei === "0") {
        return;
      }

      // get address of latest sender of most recent transaction
      // first, get the last 10 blocks
      var currentBlock = await customWeb3.eth.getBlockNumber();
      var txs = [];
      var start = currentBlock - 100 < 0 ? 0 : currentBlock - 100;
      for (var i = start; i <= currentBlock; i++) {
        // add any transactions found in the blocks to the txs array
        var block = await customWeb3.eth.getBlock(i, true);
        txs = txs.concat(block.transactions);
      }
      // sort by nonce and take latest senders address and
      // return wei to the senders address
      var filteredTxs = txs.filter(function (t) {
        return t.to && t.to.toLowerCase() === address.toLowerCase();
      });
      var mostRecent = filteredTxs.sort(function (a, b) {
        return b.nonce - a.nonce;
      })[0];
      if (!mostRecent) {
        // Browser wallet overfunded, but couldnt find most recent tx in last 100 blocks
        return;
      }
      localStorage.setItem("refunding", Web3.utils.fromWei(wei, "finney") + "," + mostRecent.from);
      console.log("Refunding " + wei + " to " + mostRecent.from + " from " + address);
      var origBalance = new _bignumber2.default((await customWeb3.eth.getBalance(address)));
      var newMax = origBalance.minus(new _bignumber2.default(wei));

      try {
        var res = await customWeb3.eth.sendTransaction({
          from: address,
          to: mostRecent.from,
          value: wei
        });
        var tx = await customWeb3.eth.getTransaction(res.transactionHash);
        console.log("Returned deposit tx: " + JSON.stringify(tx, null, 2));
        // calculate expected balance after transaction and set in local
        // storage. once the tx is submitted, the wallet balance should
        // always be lower than the expected balance, because of added
        // gas costs
        localStorage.setItem("maxBalanceAfterRefund", newMax.toFixed(0));
      } catch (e) {
        console.log("Error with refund transaction:", e.message);
        localStorage.removeItem("maxBalanceAfterRefund");
      }
      localStorage.removeItem("refunding");
      // await this.setWeb3(localStorage.getItem("rpc-prod"));
    }

    // returns a BigNumber

  }, {
    key: "calculateWeiToRefund",
    value: function calculateWeiToRefund(wei, connextState) {
      // channel max tokens is minimum of the ceiling that
      // the hub would exchange, or a set deposit max
      var ceilingWei = new _CurrencyConvertable2.default(_CurrencyTypes.CurrencyType.BEI, _bignumber2.default.min(HUB_EXCHANGE_CEILING, CHANNEL_DEPOSIT_MAX), function () {
        return (0, _getExchangeRates2.default)(connextState);
      }).toWEI().amountBigNumber;

      var weiToRefund = _bignumber2.default.max(new _bignumber2.default(wei).minus(ceilingWei), new _bignumber2.default(0));

      return weiToRefund.toFixed(0);
    }
  }, {
    key: "autoSwap",
    value: async function autoSwap() {
      var _state6 = this.state,
          channelState = _state6.channelState,
          connextState = _state6.connextState;

      if (!connextState || !connextState.runtime.canExchange) {
        return;
      }
      var weiBalance = new _bignumber2.default(channelState.balanceWeiUser);
      var tokenBalance = new _bignumber2.default(channelState.balanceTokenUser);
      if (channelState && weiBalance.gt(new _bignumber2.default("0")) && tokenBalance.lte(HUB_EXCHANGE_CEILING)) {
        await this.state.connext.exchange(channelState.balanceWeiUser, "wei");
      }
    }
  }, {
    key: "checkStatus",
    value: async function checkStatus() {
      var runtime = this.state.runtime;

      var refundStr = localStorage.getItem("refunding");
      var hasRefund = !!refundStr ? refundStr.split(",") : null;
      if (runtime.syncResultsFromHub[0]) {
        var deposit = void 0;
        var withdraw = void 0;
        /* if (runtime.syncResultsFromHub[0].type === 'thread') {
          let syncResult = runtime.syncResultsFromHub[0]
          console.log('Handling thread event in sync results...', syncResult)
          if (syncResult.update.state.txCount == 0) {
            syncResult.update.state.txCount = 1
          }
          // Handle thread requests
          await this.state.connext.stateUpdateController.handleSyncItem(syncResult);
          } else {
          */
        // Non-thread updates
        switch (runtime.syncResultsFromHub[0].update.reason) {
          case "ProposePendingDeposit":
            if (runtime.syncResultsFromHub[0].update.args.depositTokenUser !== "0" || runtime.syncResultsFromHub[0].update.args.depositWeiUser !== "0") {
              this.closeConfirmations();
              deposit = "PENDING";
            }
            break;
          case "ProposePendingWithdrawal":
            if (runtime.syncResultsFromHub[0].update.args.withdrawalTokenUser !== "0" || runtime.syncResultsFromHub[0].update.args.withdrawalWeiUser !== "0") {
              this.closeConfirmations();
              withdraw = "PENDING";
            }
            break;
          case "ConfirmPending":
            if (this.state.status.depositHistory === "PENDING") {
              this.closeConfirmations("deposit");
              deposit = "SUCCESS";
            } else if (this.state.status.withdrawHistory === "PENDING") {
              this.closeConfirmations("withdraw");
              withdraw = "SUCCESS";
            }
            break;
          default:
        }
        //}
        this.setState({ status: { deposit: deposit, withdraw: withdraw, hasRefund: hasRefund } });
      }
    }
  }, {
    key: "getCustodialBalance",
    value: async function getCustodialBalance() {
      var _state7 = this.state,
          hubUrl = _state7.hubUrl,
          address = _state7.address,
          customWeb3 = _state7.customWeb3;

      var opts = {
        web3: customWeb3,
        hubUrl: hubUrl, // in dev-mode: http://localhost:8080,
        user: address,
        origin: "localhost", // TODO: what should this be
        cookie: document.cookie
      };

      try {
        //const custodialBalance = await axios.get(`${hubUrl}/channel/${address}/sync?lastChanTx=27&lastThreadUpdateId=0`, opts);
        //const custodialBalance = await axios.get(`${hubUrl}/custodial/${address}/balance`, opts);
        //console.log('custodial balance ', custodialBalance)
      } catch (err) {
        console.log(err.message);
      }
    }

    // ************************************************* //
    //                    Handlers                       //
    // ************************************************* //

  }, {
    key: "authorizeHandler",
    value: async function authorizeHandler() {
      var _state8 = this.state,
          customWeb3 = _state8.customWeb3,
          hubUrl = _state8.hubUrl,
          opts = _state8.opts;

      var web3 = customWeb3;
      var challengeRes = await _axios2.default.post(hubUrl + "/auth/challenge", opts);
      console.log('authorizeHandler ', challengeRes);

      var nonce = challengeRes.data.nonce;
      var ORIGIN = "hub.spankchain.com";
      var hash = web3.utils.sha3(HASH_PREAMBLE + " " + web3.utils.sha3(nonce) + " " + web3.utils.sha3(ORIGIN));

      var signature = await web3.eth.personal.sign(hash, this.state.address);
      console.log('auth sig: ', signature);
      try {
        var authRes = await _axios2.default.post(hubUrl + "/auth/response", {
          nonce: challengeRes.data.nonce,
          address: this.state.address,
          origin: ORIGIN,
          signature: signature
        }, opts);
        var token = authRes.data.token;
        document.cookie = "hub.sid=" + token;
        console.log("cookie set: " + token);
        var res = await _axios2.default.get(hubUrl + "/auth/status", opts);
        if (res.data.success) {
          this.setState({ authorized: true });
          return res.data.success;
        } else {
          this.setState({ authorized: false });
        }
        console.log("Auth status: " + JSON.stringify(res.data));
      } catch (e) {
        console.log(e);
      }
    }
  }, {
    key: "updateApprovalHandler",
    value: function updateApprovalHandler(evt) {
      this.setState({
        approvalWeiUser: evt.target.value
      });
    }
  }]);

  return App;
}();

exports.default = App;