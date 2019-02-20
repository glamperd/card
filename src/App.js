import React from "react";
import "./App.css";
import { setWallet } from "./utils/actions.js";
import { createStore } from "redux";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Home from "./components/Home";
import DepositCard from "./components/depositCard";
import { getConnextClient } from "connext/dist/Connext.js";
import ProviderOptions from "./utils/ProviderOptions.ts";
import clientProvider from "./utils/web3/clientProvider.ts";
import { createWalletFromMnemonic } from "./walletGen";
import axios from "axios";
import { Grid, Paper, withStyles } from "@material-ui/core";
import AppBarComponent from "./components/AppBar";
import SettingsCard from "./components/settingsCard";
import ReceiveCard from "./components/receiveCard";
import SendCard from "./components/sendCard";
import CashOutCard from "./components/cashOutCard";

export const store = createStore(setWallet, null);

const Web3 = require("web3");
const eth = require("ethers");
const humanTokenAbi = require("./abi/humanToken.json");
const wethAbi = require("./abi/weth.json");

const env = process.env.NODE_ENV;
let tokenAbi;
if (env === "production") {
  tokenAbi = wethAbi;
} else {
  tokenAbi = humanTokenAbi;
}
console.log(`starting app in env: ${JSON.stringify(process.env, null, 1)}`);
const hubUrl = process.env.REACT_APP_HUB_URL.toLowerCase();
// Provider urls
const localProvider = process.env.REACT_APP_LOCAL_RPC_URL.toLowerCase();
const rinkebyProvider = process.env.REACT_APP_RINKEBY_RPC_URL.toLowerCase();
const mainnetProvider = process.env.REACT_APP_MAINNET_RPC_URL.toLowerCase();

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

const styles = theme => ({
  paper: {
    paddingBottom: theme.spacing.unit * 2,
    height: 550
  },
  app: {
    flexGrow: 1,
    fontFamily: ["proxima-nova", "sans-serif"],
    /* background-color: #fcfbf3; */
    /* background-color:  //#c8d0de */
    /* background-color: #F4F5F7; */
    backgroundColor: "#FFF"
  }
});

class App extends React.Component {
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
      channelState: {
        balanceTokenUser: "0"
      },
      exchangeRate: "0.00",
      interval: null,
      connextState: null,
      sendScanArgs: {
        amount: null,
        recipient: null
      },
      address: ""
    };

    this.networkHandler = this.networkHandler.bind(this);
  }

  // ************************************************* //
  //                     Hooks                         //
  // ************************************************* //

  async componentDidMount() {
    // Set up state
    const mnemonic = localStorage.getItem("mnemonic");
    let rpc = localStorage.getItem("rpc");
    // TODO: better way to set default provider
    if (!rpc) {
      rpc = env === "development" ? "LOCALHOST" : "RINKEBY";
      localStorage.setItem("rpc", rpc);
    }
    // If a browser address exists, create wallet
    if (mnemonic) {
      const delegateSigner = await createWalletFromMnemonic(mnemonic);
      const address = await delegateSigner.getAddressString();
      console.log("address: ", address);
      this.setState({ delegateSigner, address });
      store.dispatch({
        type: "SET_WALLET",
        text: delegateSigner
      });

      // // If a browser address exists, instantiate connext
      // console.log('this.state.delegateSigner', this.state.delegateSigner)
      // if (this.state.delegateSigner) {
      await this.setWeb3(rpc);
      await this.setConnext();
      await this.setTokenContract();
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

  async networkHandler(rpc) {
    // called from settingsCard when a new RPC URL is connected
    // will create a new custom web3 and reinstantiate connext
    localStorage.setItem("rpc", rpc);
    await this.setWeb3(rpc);
    await this.setConnext();
    await this.setTokenContract();
    return;
  }

  // either LOCALHOST MAINNET or RINKEBY
  async setWeb3(rpc) {
    let rpcUrl;
    switch (rpc) {
      case "LOCALHOST":
        rpcUrl = localProvider;
        break;
      case "RINKEBY":
        rpcUrl = rinkebyProvider;
        break;
      case "MAINNET":
        rpcUrl = mainnetProvider;
        break;
      default:
        throw new Error(`Unrecognized rpc: ${rpc}`);
    }
    console.log("Custom provider with rpc:", rpcUrl);

    // Ask permission to view accounts
    let windowId;
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      windowId = await window.web3.eth.net.getId();
    }

    const providerOpts = new ProviderOptions(store, rpcUrl).approving();
    const provider = clientProvider(providerOpts);
    const customWeb3 = new Web3(provider);
    const customId = await customWeb3.eth.net.getId();
    this.setState({ customWeb3 });
    if (windowId && windowId !== customId) {
      alert("Make sure your metamask and card are using the same network");
    }
    return;
  }

  async setTokenContract() {
    try {
      let { customWeb3, tokenContract } = this.state;
      tokenContract = new customWeb3.eth.Contract(tokenAbi, tokenAddress);
      this.setState({ tokenContract });
      console.log("Set up token contract details");
    } catch (e) {
      console.log("Error setting token contract");
      console.log(e);
    }
  }

  async setConnext() {
    const { hubWalletAddress, channelManagerAddress, address, customWeb3 } = this.state;

    const opts = {
      web3: customWeb3,
      hubAddress: hubWalletAddress, //"0xfb482f8f779fd96a857f1486471524808b97452d" ,
      hubUrl: hubUrl, //http://localhost:8080,
      contractAddress: channelManagerAddress, //"0xa8c50098f6e144bf5bae32bdd1ed722e977a0a42",
      user: address,
      tokenAddress: tokenAddress
    };
    console.log("Setting up connext with opts:", opts);

    // *** Instantiate the connext client ***
    const connext = getConnextClient(opts);
    console.log("Successfully set up connext!");
    this.setState({ connext });
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
    const response = await fetch("https://api.coinbase.com/v2/exchange-rates?currency=ETH");
    const json = await response.json();
    this.setState({
      exchangeRate: json.data.rates.USD
    });
  }

  async autoDeposit() {
    const { address, tokenContract, customWeb3, connextState } = this.state;
    const balance = await customWeb3.eth.getBalance(address);
    let tokenBalance = "0";
    try {
      tokenBalance = await tokenContract.methods.balanceOf(address).call();
    } catch (e) {
      console.warn(
        `Error fetching token balance, are you sure the token address (addr: ${tokenAddress}) is correct for the selected network (id: ${await customWeb3.eth.net.getId()}))? Error: ${
          e.message
        }`
      );
    }

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

      const actualDeposit = {
        amountWei: eth.utils
          .bigNumberify(balance)
          .sub(DEPOSIT_MINIMUM_WEI)
          .toString(),
        amountToken: tokenBalance
      };

      if (actualDeposit.amountWei === "0" && actualDeposit.amountToken === "0") {
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
    if (channelState && weiBalance.gt(eth.utils.bigNumberify("0")) && tokenBalance.lte(HUB_EXCHANGE_CEILING)) {
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

    const hash = web3.utils.sha3(`${HASH_PREAMBLE} ${web3.utils.sha3(challengeRes.data.nonce)} ${web3.utils.sha3("localhost")}`);

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

  render() {
    const { address, channelState, sendScanArgs, exchangeRate } = this.state;
    const { classes } = this.props;
    return (
      <Router>
        <div className={classes.app}>
          <Grid container spacing={24} direction="row" justify="center" alignItems="center">
            <Grid item xs={12} sm={4}>
              <Paper className={classes.paper}>
                <AppBarComponent address={address} />
                <Route exact path="/" render={() => <Home address={address} channelState={channelState} publicUrl={publicUrl} />} />
                <Route path="/deposit" render={() => <DepositCard address={address} minDepositWei={DEPOSIT_MINIMUM_WEI} />} />
                <Route path="/settings" render={() => <SettingsCard networkHandler={this.networkHandler} />} />
                <Route path="/receive" render={() => <ReceiveCard address={address} channelState={channelState} publicUrl={publicUrl} />} />
                <Route
                  path="/send"
                  render={() => <SendCard address={address} channelState={channelState} publicUrl={publicUrl} scanArgs={sendScanArgs} />}
                />
                <Route
                  path="/cashout"
                  render={() => <CashOutCard address={address} channelState={channelState} publicUrl={publicUrl} exchangeRate={exchangeRate} />}
                />
              </Paper>
            </Grid>
          </Grid>
        </div>
      </Router>
    );
  }
}

export default withStyles(styles)(App);
