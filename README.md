# Card

A simple offchain wallet, hosted in the browser, which utilizes Indra payment channels. Inspired by the SpankCard and Austin Griffith's burner wallet.

See it on Rinkeby at: https://card.connext.network

Mainnet implementation: https://daicard.io (coming soon!)

## Contents
- [Overview](#overview)
    - [Local Development](#local-development)
    - [Developing Client Alongside](#developing-connext-client-alongside)
- [Integrating into your App](#integrating-into-your-app)
    - [Autosigner vs. Metamask](#autosigner-vs-metamask)
    - [Instantiating the Connext Client](#instantiating-the-connext-client)
    - [Making Deposits to Channels](#making-deposits-to-channels)
    - [Making ETH <-> Token Swaps](#making-eth-to-token-swaps)
    - [Making Payments](#making-payments)
    - [Withdrawals](#withdrawals)
    - [Advanced - Considerations For Hub Operators](#advanced---considerations-for-hub-operators)

## Overview

Developer note: for branch `get-hub-config` to be functional in production, the updates from indra branch `config-endpoint` need to be merged to master, deployed to prod, and have it's client changed published to npm.

### Local development

1. Make sure you have indra running locally. Check out the instructions at https://github.com/ConnextProject/indra

TL;DR:

```
git clone https://github.com/ConnextProject/indra.git
cd indra
npm start
```

2. Clone this repo and install dependencies

```
git clone https://github.com/ConnextProject/card.git
cd card
npm i
```

3. Start the app in developer-mode

```
npm start
```

4. Browse to localhost:3000

### Developing Connext Client Alongside 

```
# From the card repo, assuming indra has been cloned & started in the parent directory
cp -rf ../indra/modules/client connext
rm -rf node_modules/connext
ln -s ../connext node_modules/connext
# then restart local development according to the instructions above
```

## Integrating into your App

This card is a simple implementation of the Connext Client package. If you'd like to integrate p2p micropayments into your application, you have a few options: 

(1) Simply embed the card in your app or link to it for payments
(2) Build a more "bespoke" integration to fit your needs

In this section, we'll describe how the Client is integrated into the card, as well as the steps that you'll need to take to build a seamless UX.

### Autosigner vs Metamask

In the card, you deposit to a hot wallet that we've generated. This is because interactions with payment channels require a number of signatures and confirmations on behalf of the end user. It's very, very bad UX to make a user sign 4 messages with Metamask to complete a single payment. Our solution is to generate a hot wallet, store the private keys locally, and use a custom Web3 provider to automatically sign transactions with that wallet. We strongly recommend that you follow a similar process.

We instantiate Web3 in App.js using our [custom provider](https://github.com/ConnextProject/card/tree/master/src/utils/web3) as follows:

```
  async setWeb3(rpc) {
    let rpcUrl, hubUrl;
    
    // SET RPC
    switch (rpc) {
      case "LOCALHOST":
        rpcUrl = localProvider;
        hubUrl = hubUrlLocal;
        break;
      case "RINKEBY":
        rpcUrl = rinkebyProvider;
        hubUrl = hubUrlRinkeby;
        break;
      case "MAINNET":
        rpcUrl = mainnetProvider;
        hubUrl = hubUrlMainnet;
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

    // Set provider options to current RPC
    const providerOpts = new ProviderOptions(store, rpcUrl).approving();
    
    // Create provider 
    const provider = clientProvider(providerOpts);
    
    // Instantiate Web3 using provider
    const customWeb3 = new Web3(provider);
    
    // Get network ID to set guardrails
    const customId = await customWeb3.eth.net.getId();
    
    // NOTE: token/contract/hubWallet ddresses are set to state while initializing connext
    this.setState({ customWeb3, hubUrl });
    if (windowId && windowId !== customId) {
      alert(`Your card is set to ${JSON.stringify(rpc)}. To avoid losing funds, please make sure your metamask and card are using the same network.`);
    }
    return;
  }
  ```
  
### Instantiating the Connext Client

Once you've instantiated Web3 (whether through a custom provider or the Metamask injection), you need to start up the Connext Client. We do this by creating a Connext object in App.js and then passing it as a prop to any components that require it. 

```
async setConnext() {
    const { address, customWeb3, hubUrl } = this.state;

    const opts = {
      web3: customWeb3,
      hubUrl, //url of hub,
      user: address
    };
    console.log("Setting up connext with opts:", opts);

    // *** Instantiate the connext client ***
    const connext = await getConnextClient(opts);
    console.log(`Successfully set up connext! Connext config:`);
    console.log(`  - tokenAddress: ${connext.opts.tokenAddress}`);
    console.log(`  - hubAddress: ${connext.opts.hubAddress}`);
    console.log(`  - contractAddress: ${connext.opts.contractAddress}`);
    console.log(`  - ethNetworkId: ${connext.opts.ethNetworkId}`);
    this.setState({
      connext,
      tokenAddress: connext.opts.tokenAddress,
      channelManagerAddress: connext.opts.contractAddress,
      hubWalletAddress: connext.opts.hubAddress,
      ethNetworkId: connext.opts.ethNetworkId
    });
  }
  ```
  
  Because channel state changes when users take action, you'll likely want to poll state so that your components are working with the latest channel state:
  
  ```
    async pollConnextState() {
    // Get connext object 
    let connext = this.state.connext;
    
    // Register listeners
    connext.on("onStateChange", state => {
      console.log("Connext state changed:", state);
      this.setState({
        channelState: state.persistent.channel,
        connextState: state,
        runtime: state.runtime,
        exchangeRate: state.runtime.exchangeRate ? state.runtime.exchangeRate.rates.USD : 0
      });
    });
    
    // start polling
    await connext.start();
  }
  ```
  
 ### Making Deposits to Channels
 
 Depositing to a channel requires invoking `connext.deposit()`, referencing the Connext object that you created when you instantiated the Client. `connext.deposit()` is asynchronous, and accepts a deposit object containing strings of Wei and token values:
 
 ```
const params = {
  amountWei: "10"
  amountToken: "10"
};

await connext.deposit(params);
```

If you're not using an autosigner, you can simply wrap deposit in a component. If you are using an autosigner, however, we recommend that you have users deposit to the hot wallet that you generated and run a poller that periodically sweeps funds from the wallet into the channel itself (leaving enough in the hot wallet for gas). We implement this in App.js as follows, and set it to run on an interval:

```
async autoDeposit() {
    const { address, tokenContract, customWeb3, connextState, tokenAddress } = this.state;
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
        // console.log("Cannot deposit");
        return;
      }
      
      // Set deposit amounts
      const actualDeposit = {
        amountWei: eth.utils
          .bigNumberify(balance)
          .sub(DEPOSIT_MINIMUM_WEI)
          .toString(),
        amountToken: tokenBalance
      };

      // exit if no deposit
      if (actualDeposit.amountWei === "0" && actualDeposit.amountToken === "0") {
        console.log(`Actual deposit is 0, not depositing.`);
        return;
      }
  
      console.log(`Depositing: ${JSON.stringify(actualDeposit, null, 2)}`);
      
      // Make actual deposit
      let depositRes = await this.state.connext.deposit(actualDeposit);
    }
  }
  ```
  
### Making ETH to Token Swaps 
  
  How and if you use the in-channel swap functionality will depend largely on your use case. If you have an ecosystem with a native token, you can use in-channel swaps to onboard new users without them buying your token a priori: just have them deposit ETH and swap it for tokens from your reserve. You can also give users the option to swap in your UI.
  
  Swapping assets in-channel requires invoking `connext.exchange()`, referencing the Connext object that you created when you instantiated the Client. `connext.exchange()` is asynchronous, and accepts a balance to swap and a string representing the denomination you're swapping from:
  
 ```
 await this.state.connext.exchange("10", "wei");
 ```
  
  If you'd like users to be able to interact on your token-denominated platform without ever needing to buy your token, you can automatically swap any ETH-denominated channel deposits for your token. In the card, we've done this with an ETH<->DAI swap. We wrote an autoSwap function that's very similar to the autoDeposit in the last section; it's set to run on an interval and swaps any ETH that it finds in the channel for DAI:
  
  ```
    async autoSwap() {
    const { channelState, connextState } = this.state;
    if (!connextState || !connextState.runtime.canExchange) {
      // console.log("Cannot exchange");
      return;
    }
    const weiBalance = eth.utils.bigNumberify(channelState.balanceWeiUser);
    const tokenBalance = eth.utils.bigNumberify(channelState.balanceTokenUser);
    if (channelState && weiBalance.gt(eth.utils.bigNumberify("0")) && tokenBalance.lte(HUB_EXCHANGE_CEILING)) {
      console.log(`Exchanging ${channelState.balanceWeiUser} wei`);
      await this.state.connext.exchange(channelState.balanceWeiUser, "wei");
    }
  }
  ```
  
### Making Payments 
  
Making payments is the core functionality of Connext, and you have a great degree of flexibility in terms of implementing payments in your application. Much like the other Connext functions, you call it on the Connext object (likely passed down from App.js) and pass it parameters containing relevant Wei/Token and recipient values:

```
paymentVal: {
        meta: {
          purchaseId: "payment"
        },
        payments: [
          {
            recipient: "0x0...."
            amount: {
              amountToken: "10"
              amountWei: "0"
            },
            type: "PT_CHANNEL"
          }
        ]
      }
      
 await connext.buy(paymentVal);
 ```
 
 In the card, we've wrapped `connext.buy()` in a button; users enter an address and payment amount, the paymentVal object is updated, and the function is called onClick. However, `connext.buy()` can be implemented to fit your use case: streaming payments, for example, could run `buy` on a poller until a user stops watching a video. Alternatively, a machine could trigger a payment on receipt of data--and this is just the tip of the iceberg!
 
You'll notice that the paymentVal object allows for multiple payments. This is done so that, if you'd like, you can batch payments. This could be helpful if (e.g.) you're using Metamask as a signer instead of an autosigner and want to batch payments from a user; it could also help with invoicing or accounting if you're operating an ecosystem with a many-to-one payment paradigm.
    
### Withdrawals 

[[UNDER CONSTRUCTION]]


### Advanced - Considerations For Hub Operators 

[[UNDER CONSTRUCTION]]
  
