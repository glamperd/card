import React, { Component } from "react";
import { getConnextClient } from "connext/dist/Connext.js";
import "../App.css";
import ProviderOptions from "../utils/ProviderOptions.ts";
import clientProvider from "../utils/web3/clientProvider.ts";
import { setWallet } from "../utils/actions.js";
import { createWallet, createWalletFromMnemonic } from "../walletGen";
import { createStore } from "redux";
import axios from "axios";
import ReceiveCard from "./receiveCard";
import SendCard from "./sendCard";
import CashOutCard from "./cashOutCard";
import ChannelCard from "./channelCard";
import QRScan from "./qrScan";
import SettingsCard from "./settingsCard";
import Tooltip from "@material-ui/core/Tooltip";
import AppBar from "@material-ui/core/AppBar";
import QRIcon from "mdi-material-ui/QrcodeScan";
import Toolbar from "@material-ui/core/Toolbar";
import SettingIcon from "@material-ui/icons/Settings";
import SendIcon from "@material-ui/icons/Send";
import ReceiveIcon from "@material-ui/icons/SaveAlt";
import IconButton from "@material-ui/core/IconButton";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Typography, Fab, Card } from "@material-ui/core";
import blockies from "ethereum-blockies-png";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { store } from "../App";
import DepositCard from "./depositCard";

const Web3 = require("web3");
const Tx = require("ethereumjs-tx");
const eth = require("ethers");
const humanTokenAbi = require("../abi/humanToken.json");
const wethAbi = require("../abi/weth.json");
const noAddrBlocky = require("../assets/noAddress.png");

let tokenAbi;
if (process.env.NODE_ENV === "production") {
  tokenAbi = wethAbi;
} else {
  tokenAbi = humanTokenAbi;
}
console.log(`starting app in env: ${JSON.stringify(process.env, null, 1)}`);
const hubUrl = process.env.REACT_APP_HUB_URL.toLowerCase();
const providerUrl = process.env.REACT_APP_ETHPROVIDER_URL.toLowerCase();
const tokenAddress = process.env.REACT_APP_TOKEN_ADDRESS.toLowerCase();
const hubWalletAddress = process.env.REACT_APP_HUB_WALLET_ADDRESS.toLowerCase();
const channelManagerAddress = process.env.REACT_APP_CHANNEL_MANAGER_ADDRESS.toLowerCase();
const publicUrl = process.env.REACT_APP_PUBLIC_URL.toLowerCase();

console.log(`Using token ${tokenAddress} with abi: ${tokenAbi}`);

const HASH_PREAMBLE = "SpankWallet authentication message:";
const DEPOSIT_MINIMUM_WEI = eth.utils.parseEther("0.03"); // 30 FIN
const HUB_EXCHANGE_CEILING = eth.utils.parseEther("69"); // 69 TST

const opts = {
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    Authorization: "Bearer foo"
  },
  withCredentials: true
};

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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
      hubWalletAddress,
      channelManagerAddress,
      authorized: "false",
      approvalWeiUser: "10000",
      channelState: null,
      exchangeRate: "0.00",
      interval: null,
      connextState: null,
      sendScanArgs: {
        amount: null,
        recipient: null
      }
    };
  }

  // ************************************************* //
  //                     Hooks                         //
  // ************************************************* //

  async componentWillMount() {
    const mnemonic = localStorage.getItem("mnemonic");

    // If a browser address exists, create wallet
    if (mnemonic) {
      const delegateSigner = await createWalletFromMnemonic(mnemonic);
      const address = await delegateSigner.getAddressString();
      this.setState({ delegateSigner, address });
      store.dispatch({
        type: "SET_WALLET",
        text: delegateSigner
      });
    } else {
      // Else, we wait for user to finish selecting through modal which will refresh page when done
      const { modals } = this.state;
      this.setState({ modals: { ...modals, keyGen: true } });
    }
  }

  async componentDidMount() {
    // Set up state
    await this.setWeb3();
    await this.setTokenContract();

    // If a browser address exists, instantiate connext
    if (this.state.delegateSigner) {
      await this.setConnext();
      await this.authorizeHandler();

      console.log(this.state.connext);
      await this.pollConnextState();
      await this.poller();
    } else {
      // Else, we wait for user to finish selecting through modal which will refresh page when done
      const { modals } = this.state;
      this.setState({ modals: { ...modals, keyGen: true } });
    }
  }

  // ************************************************* //
  //                State setters                      //
  // ************************************************* //

  async setWeb3() {
    // Ask permission to view accounts
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        // Request account access if needed
        await window.ethereum.enable();
      } catch (error) {
        console.error(error);
      }
    }

    if (process.env.NODE_ENV != "production") {
      const windowProvider = window.web3;
      if (!windowProvider) {
        alert("Metamask is not detected.");
      }
      const web3 = new Web3(windowProvider.currentProvider);
      // make sure you are on localhost
      if ((await web3.eth.net.getId()) != 4447) {
        alert(
          "Uh oh! Doesn't look like you're using a local chain, please make sure your Metamask is connected appropriately to localhost:8545."
        );
      } else console.log("SETTING WEB3 ", web3);
      this.setState({ web3 });
      console.log("Set metamask as provider");
    } else {
      const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));
      this.setState({ web3 });
    }
    return;
  }

  async setTokenContract() {
    try {
      let { web3, tokenContract } = this.state;
      tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress);
      this.setState({ tokenContract });
      console.log("Set up token contract details");
    } catch (e) {
      console.log("Error setting token contract");
      console.log(e);
    }
  }

  async setConnext() {
    const {
      hubWalletAddress,
      channelManagerAddress,
      tokenContract,
      address
    } = this.state;

    const providerOpts = new ProviderOptions(store).approving();
    const provider = clientProvider(providerOpts);
    const web3 = new Web3(provider);

    const opts = {
      web3,
      hubAddress: hubWalletAddress, //"0xfb482f8f779fd96a857f1486471524808b97452d" ,
      hubUrl: hubUrl, //http://localhost:8080,
      contractAddress: channelManagerAddress, //"0xa8c50098f6e144bf5bae32bdd1ed722e977a0a42",
      user: address,
      tokenAddress: tokenContract.options.address
    };
    console.log("Setting up connext with opts:", opts);

    // *** Instantiate the connext client ***
    const connext = getConnextClient(opts);
    console.log("Successfully set up connext!");
    this.setState({ connext, address, customWeb3: web3 });
  }

  // ************************************************* //
  //                    Pollers                        //
  // ************************************************* //

  async pollConnextState() {
    let connext = this.state.connext;
    // register listeners
    connext.on("onStateChange", state => {
      console.log("Connext state changed:", state);
      this.setState({
        channelState: state.persistent.channel,
        connextState: state
      });
    });
    // start polling
    await connext.start();
  }

  async poller() {
    await this.getRate();
    await this.autoDeposit();
    await this.autoSwap();

    setInterval(async () => {
      await this.getRate();
      await this.autoDeposit();
      await this.autoSwap();
    }, 1000);
  }

  async getRate() {
    const response = await fetch(
      "https://api.coinbase.com/v2/exchange-rates?currency=ETH"
    );
    const json = await response.json();
    this.setState({
      exchangeRate: json.data.rates.USD
    });
  }

  async autoDeposit() {
    const { address, tokenContract, web3, connextState } = this.state;
    const balance = await web3.eth.getBalance(address);
    const tokenBalance = await tokenContract.methods.balanceOf(address).call();
    if (balance !== "0" || tokenBalance !== "0") {
      if (eth.utils.bigNumberify(balance).lte(DEPOSIT_MINIMUM_WEI)) {
        // don't autodeposit anything under the threshold
        return;
      }
      // only proceed with deposit request if you can deposit
      if (!connextState || !connextState.runtime.canDeposit) {
        console.log("Cannot deposit");
        return;
      }

      // const sendArgs = {
      //   from: this.state.channelState.user
      // }
      // const gasEstimate = await approveTx.estimateGas(sendArgs)
      // if (gasEstimate > this.state.browserWalletDeposit.amountWei){
      //   throw "Not enough wei for gas"
      // }
      // if (gasEstimate < this.state.browserWalletDeposit.amountWei){
      //   const depositDiff = balance - gasEstimate
      //   this.setState({
      //     browserWalletDeposit:{
      //       amountWei: depositDiff,
      //       amountToken: tokenBalance
      //     }})
      // }
      const actualDeposit = {
        amountWei: eth.utils
          .bigNumberify(balance)
          .sub(DEPOSIT_MINIMUM_WEI)
          .toString(),
        amountToken: tokenBalance
      };

      if (actualDeposit.amountWei == "0" && actualDeposit.amountToken == "0") {
        console.log(`Actual deposit is 0, not depositing.`);
        return;
      }

      console.log(`Depositing: ${JSON.stringify(actualDeposit, null, 2)}`);
      let depositRes = await this.state.connext.deposit(actualDeposit);
      console.log(`Deposit Result: ${JSON.stringify(depositRes, null, 2)}`);
    }
  }

  async autoSwap() {
    const { channelState, connextState } = this.state;
    if (!connextState || !connextState.runtime.canExchange) {
      console.log("Cannot exchange");
      return;
    }
    const weiBalance = eth.utils.bigNumberify(channelState.balanceWeiUser);
    const tokenBalance = eth.utils.bigNumberify(channelState.balanceTokenUser);
    if (
      channelState &&
      weiBalance.gt(eth.utils.bigNumberify("0")) &&
      tokenBalance.lte(HUB_EXCHANGE_CEILING)
    ) {
      console.log(`Exchanging ${channelState.balanceWeiUser} wei`);
      await this.state.connext.exchange(channelState.balanceWeiUser, "wei");
    }
  }

  // ************************************************* //
  //                    Handlers                       //
  // ************************************************* //

  async authorizeHandler() {
    const web3 = this.state.customWeb3;
    const challengeRes = await axios.post(`${hubUrl}/auth/challenge`, {}, opts);

    const hash = web3.utils.sha3(
      `${HASH_PREAMBLE} ${web3.utils.sha3(
        challengeRes.data.nonce
      )} ${web3.utils.sha3("localhost")}`
    );

    const signature = await web3.eth.personal.sign(hash, this.state.address);

    try {
      let authRes = await axios.post(
        `${hubUrl}/auth/response`,
        {
          nonce: challengeRes.data.nonce,
          address: this.state.address,
          origin: "localhost",
          signature
        },
        opts
      );
      const token = authRes.data.token;
      document.cookie = `hub.sid=${token}`;
      console.log(`hub authentication cookie set: ${token}`);
      const res = await axios.get(`${hubUrl}/auth/status`, opts);
      if (res.data.success) {
        this.setState({ authorized: true });
        return res.data.success;
      } else {
        this.setState({ authorized: false });
      }
      console.log(`Auth status: ${JSON.stringify(res.data)}`);
    } catch (e) {
      console.log(e);
    }
  }

  updateApprovalHandler(evt) {
    this.setState({
      approvalWeiUser: evt.target.value
    });
  }

  async collateralHandler() {
    console.log(`Requesting Collateral`);
    let collateralRes = await this.state.connext.requestCollateral();
    console.log(`Collateral result: ${JSON.stringify(collateralRes, null, 2)}`);
  }

  async approvalHandler() {
    const { tokenContract, address } = this.state;
    const web3 = this.state.customWeb3;
    const approveFor = channelManagerAddress;
    const toApprove = this.state.approvalWeiUser;
    const toApproveBn = eth.utils.bigNumberify(toApprove);
    const nonce = await web3.eth.getTransactionCount(address);
    const depositResGas = await tokenContract.methods
      .approve(approveFor, toApproveBn)
      .estimateGas();
    let tx = new Tx({
      to: tokenAddress,
      nonce: nonce,
      from: address,
      gasLimit: depositResGas * 2,
      data: tokenContract.methods.approve(approveFor, toApproveBn).encodeABI()
    });
    tx.sign(
      Buffer.from(
        this.state.delegateSigner.getPrivateKeyString().substring(2),
        "hex"
      )
    );
    let signedTx = "0x" + tx.serialize().toString("hex");
    let sentTx = web3.eth.sendSignedTransaction(signedTx, err => {
      if (err) console.error(err);
    });
    sentTx
      .once("transactionHash", hash => {
        console.log(`tx broadcasted, hash: ${hash}`);
      })
      .once("receipt", receipt => {
        console.log(`tx mined, receipt: ${JSON.stringify(receipt)}`);
      });
    console.log(`Sent tx: ${typeof sentTx} with keys ${Object.keys(sentTx)}`);
  }

  scanQRCode(data) {
    data = data.split("?");
    if (data[0] == publicUrl) {
      let temp = data[1].split("&");
      let amount = temp[0].split("=")[1];
      let recipient = temp[1].split("=")[1];
      const { sendScanArgs, modals } = this.state;
      this.setState({
        sendScanArgs: { ...sendScanArgs, amount, recipient },
        modals: { ...modals, send: true }
      });
    } else {
      console.log("incorrect site");
    }
  }

  render() {
    const { modals } = this.state;
    return (
      <div className="app">
        <AppBar
          position="sticky"
          elevation="0"
          color="secondary"
          style={{ paddingTop: "2%" }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              variant="contained"
              onClick={() =>
                this.setState({ modals: { ...modals, deposit: true } })
              }
            >
              <img
                src={blockies.createDataURL({ seed: this.state.address })}
                alt={noAddrBlocky}
                style={{ width: "40px", height: "40px", marginTop: "5px" }}
              />
              <Typography
                variant="body2"
                noWrap
                style={{ width: "75px", marginLeft: "6px", color: "#c1c6ce" }}
              >
                <span>{this.state.address}</span>
              </Typography>
            </IconButton>
            <Typography variant="h6" style={{ flexGrow: 1 }} />
            <IconButton
              color="inherit"
              variant="contained"
              onClick={() =>
                this.setState({ modals: { ...modals, settings: true } })
              }
            >
              <SettingIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Modal
          id="deposit"
          open={this.state.modals.deposit}
          onClose={() =>
            this.setState({ modals: { ...modals, deposit: false } })
          }
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div>
            <DepositCard address={this.state.address} />
          </div>
        </Modal>
        <Modal
          id="settings"
          open={this.state.modals.settings}
          onClose={() =>
            this.setState({ modals: { ...modals, settings: false } })
          }
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <SettingsCard />
        </Modal>
        <div className="row" style={{ marginBottom: "-7.5%" }}>
          <div
            className="column"
            style={{ justifyContent: "space-between", flexGrow: 1 }}
          >
            <ChannelCard
              channelState={this.state.channelState}
              address={this.state.address}
            />
          </div>
        </div>
        <div className="row">
          <div
            className="column"
            style={{ marginRight: "5%", marginLeft: "80%" }}
          >
            <Fab
              style={{
                color: "#FFF",
                backgroundColor: "#fca311",
                size: "large"
              }}
              onClick={() =>
                this.setState({ modals: { ...modals, scan: true } })
              }
            >
              <QRIcon />
            </Fab>
            <Modal
              id="qrscan"
              open={this.state.modals.scan}
              onClose={() =>
                this.setState({ modals: { ...modals, scan: false } })
              }
              style={{ width: "full", height: "full" }}
            >
              <QRScan handleResult={this.scanQRCode.bind(this)} />
            </Modal>
          </div>
        </div>
        <div className="row" style={{ marginTop: "17.5%", marginBottom: "5%" }}>
          <div className="column" style={{ marginLeft: "5%" }}>
            <Button
              style={{
                marginRight: "5px",
                color: "#FFF",
                backgroundColor: "#FCA311"
              }}
              variant="contained"
              size="large"
              onClick={() =>
                this.setState({ modals: { ...modals, receive: true } })
              }
            >
              Receive
              <ReceiveIcon style={{ marginLeft: "5px" }} />
            </Button>
            <Modal
              open={this.state.modals.receive}
              onClose={() =>
                this.setState({ modals: { ...modals, receive: false } })
              }
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <ReceiveCard address={this.state.address} publicUrl={publicUrl} />
            </Modal>
          </div>
          <div className="column" style={{ marginRight: "5%" }}>
            <Button
              style={{
                marginLeft: "5px",
                color: "#FFF",
                backgroundColor: "#FCA311"
              }}
              size="large"
              variant="contained"
              onClick={() =>
                this.setState({ modals: { ...modals, send: true } })
              }
            >
              Send
              <SendIcon style={{ marginLeft: "5px" }} />
            </Button>
            <Modal
              open={this.state.modals.send}
              onClose={() =>
                this.setState({ modals: { ...modals, send: false } })
              }
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <SendCard scanArgs={this.state.sendScanArgs} />
            </Modal>
          </div>
        </div>
        <div
          className="row"
          style={{ paddingTop: "5%", justifyContent: "center" }}
        >
          <Button
            color="primary"
            variant="outlined"
            size="large"
            onClick={() =>
              this.setState({ modals: { ...modals, cashOut: true } })
            }
          >
            Cash Out
          </Button>
          <Modal
            open={this.state.modals.cashOut}
            onClose={() =>
              this.setState({ modals: { ...modals, cashOut: false } })
            }
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <CashOutCard />
          </Modal>
        </div>
      </div>
    );
  }
}
