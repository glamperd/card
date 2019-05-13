"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.store = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
//import { getConnextClient } from "connext/dist/Connext.js";

//import BigNumber from "bignumber.js";
//import {CurrencyType} from "connext/dist/state/ConnextState/CurrencyTypes";
//import CurrencyConvertable from "connext/dist/lib/currency/CurrencyConvertable";
//import getExchangeRates from "connext/dist/lib/getExchangeRates";


exports.start = start;

var _actions = require("./utils/actions.js");

var _redux = require("redux");

var _connext = require("connext");

var _connext2 = _interopRequireDefault(_connext);

var _dist = require("connext/dist");

var _ProviderOptions = require("../dist/utils/ProviderOptions.js");

var _ProviderOptions2 = _interopRequireDefault(_ProviderOptions);

var _clientProvider = require("../dist/utils/web3/clientProvider.js");

var _clientProvider2 = _interopRequireDefault(_clientProvider);

var _bn = require("connext/dist/lib/bn.js");

var _walletGen = require("./walletGen");

var _axios = require("axios");

var _axios2 = _interopRequireDefault(_axios);

var _intervalPromise = require("interval-promise");

var _intervalPromise2 = _interopRequireDefault(_intervalPromise);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _Storage = require("./utils/Storage.js");

var _Storage2 = _interopRequireDefault(_Storage);

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _http = require("http");

var _http2 = _interopRequireDefault(_http);

var _socket = require("socket.io");

var _socket2 = _interopRequireDefault(_socket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CurrencyType = _dist.types.CurrencyType,
    CurrencyConvertable = _dist.types.CurrencyConvertable;

var _ref = new _connext2.default.Utils(),
    getExchangeRates = _ref.getExchangeRates,
    hasPendingOps = _ref.hasPendingOps;
//const { Big, maxBN, minBN } = Connext.big


var store = exports.store = (0, _redux.createStore)(_actions.setWallet, null);

var publicUrl = 'localhost';
var localStorage = new _Storage2.default();
var webSocket = void 0;

var Web3 = require("web3");
var eth = require("ethers");
//const BN = Web3.utils.BN;
//const humanTokenAbi = require("./abi/humanToken.json");

var env = process.env.NODE_ENV;
var ERC20 = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "minter", "outputs": [{ "name": "", "type": "address" }], "payable": false, "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "o_success", "type": "bool" }], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "type": "function" }, { "constant": false, "inputs": [{ "name": "_recipient", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "createIlliquidToken", "outputs": [{ "name": "o_success", "type": "bool" }], "payable": false, "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_recipient", "type": "address" }, { "name": "_amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "o_success", "type": "bool" }], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "endMintingTime", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "type": "function" }, { "constant": false, "inputs": [{ "name": "_recipient", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "createToken", "outputs": [{ "name": "o_success", "type": "bool" }], "payable": false, "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "payable": false, "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "illiquidBalance", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "type": "function" }, { "constant": false, "inputs": [{ "name": "_recipient", "type": "address" }, { "name": "_amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "o_success", "type": "bool" }], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "LOCKOUT_PERIOD", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "o_remaining", "type": "uint256" }], "payable": false, "type": "function" }, { "constant": false, "inputs": [], "name": "makeLiquid", "outputs": [], "payable": false, "type": "function" }, { "inputs": [{ "name": "_minter", "type": "address" }, { "name": "_endMintingTime", "type": "uint256" }], "payable": false, "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_from", "type": "address" }, { "indexed": true, "name": "_recipient", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_owner", "type": "address" }, { "indexed": true, "name": "_spender", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" }], "name": "Approval", "type": "event" }];

var tokenAbi = ERC20;
var WS_PORT = 1337;
var MAX_HISTORY_ITEMS = 20;

var StatusEnum = { stopped: "stopped", running: "running", paused: "paused" };

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

var DEPOSIT_ESTIMATED_GAS = new _bn.Big("700000"); // 700k gas
//const DEPOSIT_MINIMUM_WEI = new BigNumber(Web3.utils.toWei("0.020", "ether")); // 30 FIN
var HUB_EXCHANGE_CEILING = eth.constants.WeiPerEther.mul((0, _bn.Big)(69)); // 69 TST
var CHANNEL_DEPOSIT_MAX = eth.constants.WeiPerEther.mul((0, _bn.Big)(30)); // 30 TST
var HASH_PREAMBLE = "SpankWallet authentication message:";
var LOW_BALANCE_THRESHOLD = (0, _bn.Big)(process.env.LOW_BALANCE_THRESHOLD);

function start() {
  var app = new App();
  app.init();
  //console.log('state:', app.state);
}

var App = function () {
  function App() {
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
      browserMinimumBalance: null,
      autopayState: StatusEnum.stopped,
      history: []
    };

    //this.networkHandler = this.networkHandler.bind(this);
  }

  // ************************************************* //
  //                     Hooks                         //
  // ************************************************* //

  _createClass(App, [{
    key: "setState",
    value: function setState(entry) {
      for (var prop in entry) {
        this.state[prop] = entry[prop];
      }
    }
  }, {
    key: "init",
    value: async function init() {

      var storeFile = "./.store";

      // Set up state
      var data;
      var fileStore;
      try {
        data = _fs2.default.readFileSync(storeFile, 'utf8');
        //console.log(data)
        fileStore = new Map(JSON.parse(data));
        //console.log('store data', fileStore)
      } catch (err) {
        console.log(err.message);
      }

      // Set up state
      var mnemonic = fileStore.get("mnemonic");
      //console.log('mnemonic', mnemonic);
      // on mount, check if you need to refund by removing maxBalance
      fileStore.delete("refunding");
      var rpc = fileStore.get("rpc-prod");
      // TODO: better way to set default provider
      // if it doesnt exist in storage
      if (!rpc) {
        rpc = "ROPSTEN"; //env === "development" ? "LOCALHOST" : "MAINNET";
        fileStore.set("rpc-prod", rpc);
      }
      // If a browser address exists, create wallet
      if (mnemonic) {
        var delegateSigner = await (0, _walletGen.createWalletFromMnemonic)(mnemonic);
        var address = await delegateSigner.getAddressString();
        //TODO - no state
        this.setState({
          'delegateSigner': delegateSigner,
          'address': address,
          mnemonic: mnemonic
        });
        //console.log('address', address)
        store.dispatch({
          type: "SET_WALLET",
          text: delegateSigner
        });

        console.log('setWeb3');
        await this.setWeb3(rpc);
        console.log('setConnext');
        await this.setConnext();
        console.log('setTokencontract');
        await this.setTokenContract();

        console.log('pollConnextState');
        await this.pollConnextState();
        console.log('setBrowserWalletMinimumBalance');
        await this.setBrowserWalletMinimumBalance();
        console.log('poller');
        await this.poller();
      } else {
        // Else, we create a new address
        var _delegateSigner = await (0, _walletGen.createWallet)(this.state.web3);
        var _address = await _delegateSigner.getAddressString();
        this.setState({
          'delegateSigner': _delegateSigner,
          'address': _address
        });
        store.dispatch({
          type: "SET_WALLET",
          text: _delegateSigner
        });
        // Then refresh the page
        //window.location.reload();
      }

      // Initialise authorisation
      //await this.authorizeHandler();

      // Start websockets server
      await this.startWsServer();
    }
  }, {
    key: "startWsServer",
    value: async function startWsServer() {
      var _this = this;

      var express = (0, _express2.default)();
      var server = _http2.default.Server(express);
      webSocket = (0, _socket2.default)(server);

      server.listen(WS_PORT);

      console.log("Listening on port " + WS_PORT + "...");
      // WARNING: app.listen(80) will NOT work here!

      express.get('/', function (req, res) {
        res.sendFile(__dirname + '/index.html');
      });

      webSocket.on('connection', function (socket) {
        console.log('WS connection');
        socket.emit('autopay', { is: 'connected' });
        socket.on('payment-request', async function (request) {
          console.log('payment request', request);
          var payRequest = JSON.parse(request);
          await _this.sendPayment(payRequest.to, payRequest.amount);
        });

        socket.on('status', function () {
          //console.log('received status request')
          _this.sendStatusMessage();
        });

        socket.on('pause', function () {
          console.log("pausing at client's request");
          _this.pausePaymentsAndNotify();
        });

        socket.on('release', function () {
          console.log("resuming at client's request");
          _this.resumePaymentsAndNotify();
        });
      });

      this.setState({ autopayState: StatusEnum.running });
    }
  }, {
    key: "sendStatusMessage",
    value: async function sendStatusMessage() {
      var status = {
        address: this.state.address,
        balance: this.state.channelState ? this.state.channelState.balanceTokenUser : "0",
        txHistory: this.state.history,
        hubCollateral: this.state.channelState ? this.state.channelState.balanceTokenHub : "0",
        status: this.state.autopayState
      };
      webSocket.emit('status', JSON.stringify(status));
    }

    // ************************************************* //
    //                State setters                      //
    // ************************************************* //

    // either LOCALHOST MAINNET or RINKEBY

  }, {
    key: "setWeb3",
    value: async function setWeb3(rpc) {
      console.log('setWeb rpc', rpc);
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
      console.log('hubUrl', hubUrl);

      var providerOpts = new _ProviderOptions2.default(store, rpcUrl, hubUrl).approving();
      var provider = (0, _clientProvider2.default)(providerOpts);
      var customWeb3 = new Web3(provider);
      var customId = await customWeb3.eth.net.getId();
      // NOTE: token/contract/hubWallet ddresses are set to state while initializing connext

      console.log('saving state...', customId);
      //TODO - no state
      //this.setState({ customWeb3, hubUrl, rpcUrl });
      this.setState({
        'customWeb3': customWeb3,
        'hubUrl': hubUrl,
        'rpcUrl': rpcUrl
      });

      // TODO - check network
      /*
      if (windowId && windowId !== customId) {
        alert(
          `Your card is set to ${JSON.stringify(
            rpc
          )}. To avoid losing funds, please make sure your metamask and card are using the same network.`
        );
      }
      */
      return;
    }
  }, {
    key: "sendPayment",
    value: async function sendPayment(toAccount, amount) {
      // Check status
      if (this.state.autopayState !== StatusEnum.running) {
        console.log('Payment requested but autosigning is paused');
        return;
      }
      debugger;
      var balance = this.state.channelState ? this.state.channelState.balanceTokenUser : 0;
      var amtWei = Web3.utils.toWei(amount);
      var payAmount = Web3.utils.isBN(amtWei) ? amtWei : (0, _bn.Big)(amtWei);
      var bnBal = (0, _bn.Big)(balance);
      if (bnBal.lt(payAmount)) {
        console.log(" Payment declined. Requested payment amount: " + payAmount + " exceeds balance: " + balance + ".");
        return;
      }

      var payment = {
        meta: {
          purchaseId: "payment"
          // memo: "",
        },
        payments: [{
          recipient: toAccount,
          amount: {
            amountToken: amtWei,
            amountWei: "0"
          },
          type: "PT_CHANNEL"
        }]
      };

      try {
        await this.state.connext.buy(payment);
        this.addToHistory(payment);
        console.log('sendPayment done');
      } catch (err) {
        console.log(err.message);
      }

      // Evaluate new balance. See if autosigning should be paused.
      balance = this.state.channelState ? this.state.channelState.balanceTokenUser : '0';
      bnBal = (0, _bn.Big)(balance);
      if (bnBal.lte(LOW_BALANCE_THRESHOLD)) {
        this.pausePaymentsAndNotify();
      }
    }
  }, {
    key: "pausePaymentsAndNotify",
    value: function pausePaymentsAndNotify() {
      webSocket.emit('pausing', 'Temporarily pausing payments.');
      this.setState({ autopayState: StatusEnum.paused });
      this.sendStatusMessage();
    }
  }, {
    key: "resumePaymentsAndNotify",
    value: function resumePaymentsAndNotify() {
      webSocket.emit('resuming', 'Temporarily resuming payments.');
      this.setState({ autopayState: StatusEnum.running });
      this.sendStatusMessage();
    }
  }, {
    key: "checkForTopup",
    value: function checkForTopup() {
      if (this.state.autopayState === StatusEnum.paused) {
        var balance = this.state.channelState ? this.state.channelState.balanceTokenUser : 0;
        var bnBal = (0, _bn.Big)(balance);
        if (bnBal.gt(LOW_BALANCE_THRESHOLD)) {
          this.resumePaymentsAndNotify();
        }
      }
    }
  }, {
    key: "addToHistory",
    value: async function addToHistory(event) {
      var eventText = '';
      if (event.meta && event.meta.purchaseId === "payment") {
        eventText = "Payment of " + Web3.utils.fromWei(event.payments[0].amount.amountToken) + " to " + event.payments[0].recipient + ". Type: " + event.payments[0].type;
      }

      var history = this.state.history;

      if (history.length >= MAX_HISTORY_ITEMS) {
        history.pop();
      }
      history.unshift(eventText);
      this.setState({ history: history });
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
      console.log('setting Connext');
      var _state2 = this.state,
          address = _state2.address,
          customWeb3 = _state2.customWeb3,
          hubUrl = _state2.hubUrl,
          mnemonic = _state2.mnemonic;


      var opts = {
        web3: customWeb3,
        hubUrl: hubUrl, // in dev-mode: http://localhost:8080,
        user: address,
        origin: "localhost", // TODO: what should this be
        mnemonic: mnemonic
      };

      // *** Instantiate the connext client ***
      console.log('getting Connext client');
      try {
        var connext = await (0, _dist.createClient)(opts);
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
      } catch (err) {
        console.log(err.message);
      }
    }

    // ************************************************* //
    //                    Pollers                        //
    // ************************************************* //

  }, {
    key: "pollConnextState",
    value: async function pollConnextState() {
      var _this2 = this;

      var connext = this.state.connext;
      // register listeners
      connext.on("onStateChange", function (state) {
        console.log("Connext state changed:");
        _this2.setState({
          channelState: state.persistent.channel,
          connextState: state,
          runtime: state.runtime,
          exchangeRate: state.runtime.exchangeRate ? state.runtime.exchangeRate.rates.USD : 0
        });
        // Check whether, if autosigning is paused, the balance has been topped up sufficiently.
        _this2.checkForTopup();
      });
      // start polling
      await connext.start();
      console.log('connext loaded');
      this.setState({ loadingConnext: false });
    }
  }, {
    key: "poller",
    value: async function poller() {
      var _this3 = this;

      await this.autoDeposit();
      await this.autoSwap();

      (0, _intervalPromise2.default)(async function (iteration, stop) {
        await _this3.autoDeposit();
      }, 5000);

      (0, _intervalPromise2.default)(async function (iteration, stop) {
        await _this3.autoSwap();
      }, 1000);

      (0, _intervalPromise2.default)(async function (iteration, stop) {
        await _this3.checkStatus();
      }, 400);

      (0, _intervalPromise2.default)(async function (iteration, stop) {
        await _this3.getCustodialBalance();
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
      var defaultGas = new _bn.Big((await customWeb3.eth.getGasPrice()));
      // default connext multiple is 1.5, leave 2x for safety
      var depositGasPrice = DEPOSIT_ESTIMATED_GAS.multipliedBy(new _bn.Big(2)).multipliedBy(defaultGas);
      // add dai conversion
      var minConvertable = new CurrencyConvertable(CurrencyType.WEI, depositGasPrice, function () {
        return getExchangeRates(connextState);
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
      if (maxBalanceAfterRefund && new _bn.Big(balance).gte(new _bn.Big(maxBalanceAfterRefund))) {
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
        var minWei = new _bn.Big(browserMinimumBalance.wei);
        if (new _bn.Big(balance).lt(minWei)) {
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
          var refundWei = _bn.Big.max(new _bn.Big(balance).minus(minWei), 0);
          await this.returnWei(refundWei.toFixed(0));
          return;
        }

        var channelDeposit = {
          amountWei: new _bn.Big(balance).minus(minWei).toFixed(0),
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
        var weiDeposit = new _bn.Big(channelDeposit.amountWei).minus(new _bn.Big(weiToReturn));
        channelDeposit.amountWei = weiDeposit.toFixed(0);

        await this.state.connext.deposit(channelDeposit);
        this.addToHistory(channelDeposit);
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
      var origBalance = new _bn.Big((await customWeb3.eth.getBalance(address)));
      var newMax = origBalance.minus(new _bn.Big(wei));

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
      var ceilingWei = new CurrencyConvertable(CurrencyType.BEI, _bn.Big.min(HUB_EXCHANGE_CEILING, CHANNEL_DEPOSIT_MAX), function () {
        return getExchangeRates(connextState);
      }).toWEI().amountBigNumber;

      var weiToRefund = _bn.Big.max(new _bn.Big(wei).minus(ceilingWei), new _bn.Big(0));

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
      var weiBalance = new _bn.Big(channelState.balanceWeiUser);
      var tokenBalance = new _bn.Big(channelState.balanceTokenUser);
      if (channelState && weiBalance.gt(new _bn.Big("0")) && tokenBalance.lte(HUB_EXCHANGE_CEILING)) {
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
        console.log('syncResultsFromHub', runtime.syncResultsFromHub[0].update.reason);
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
            this.addToHistory(runtime.syncResultsFromHub[0].update);
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