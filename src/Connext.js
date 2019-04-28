"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const actions = require("./state/actions");
const redux_1 = require("redux");
const events_1 = require("events");
const Web3 = require("web3");
const ChannelManagerAbi_1 = require("./contract/ChannelManagerAbi");
const networking_1 = require("./helpers/networking");
const BuyController_1 = require("./controllers/BuyController");
const DepositController_1 = require("./controllers/DepositController");
const SyncController_1 = require("./controllers/SyncController");
const StateUpdateController_1 = require("./controllers/StateUpdateController");
const WithdrawalController_1 = require("./controllers/WithdrawalController");
const Utils_1 = require("./Utils");
const validator_1 = require("./validator");
const types_2 = require("./types");
const store_1 = require("./state/store");
const middleware_1 = require("./state/middleware");
const reducers_1 = require("./state/reducers");
const utils_1 = require("./lib/utils");
const bn_1 = require("./helpers/bn");
const ExchangeController_1 = require("./controllers/ExchangeController");
const CollateralController_1 = require("./controllers/CollateralController");
const ThreadsController_1 = require("./controllers/ThreadsController");
const RedeemController_1 = require("./controllers/RedeemController");
class HubAPIClient {
    constructor(user, networking, tokenName) {
        // post to hub telling user wants to deposit
        this.requestDeposit = (deposit, txCount, lastThreadUpdateId) => __awaiter(this, void 0, void 0, function* () {
            if (!deposit.sigUser) {
                throw new Error(`No signature detected on the deposit request. Deposit: ${deposit}, txCount: ${txCount}, lastThreadUpdateId: ${lastThreadUpdateId}`);
            }
            const response = yield this.networking.post(`channel/${this.user}/request-deposit`, {
                depositWei: deposit.amountWei,
                depositToken: deposit.amountToken,
                sigUser: deposit.sigUser,
                lastChanTx: txCount,
                lastThreadUpdateId,
                authToken: document.authToken
            });
            return response.data;
        });
        // post to hub telling user wants to withdraw
        this.requestWithdrawal = (withdrawal, txCountGlobal) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.networking.post(`channel/${this.user}/request-withdrawal`, Object.assign({}, withdrawal, { lastChanTx: txCountGlobal }));
            return response.data;
        });
        // performer calls this when they wish to start a show
        // return the proposed deposit fro the hub which should then be verified and cosigned
        this.requestCollateral = (txCountGlobal) => __awaiter(this, void 0, void 0, function* () {
            // post to hub
            const response = yield this.networking.post(`channel/${this.user}/request-collateralization`, {
                lastChanTx: txCountGlobal,
                authToken: document.authToken
            });
            return response.data;
        });
        // post to hub to batch verify state updates
        this.updateHub = (updates, lastThreadUpdateId) => __awaiter(this, void 0, void 0, function* () {
            // post to hub
            const response = yield this.networking.post(`channel/${this.user}/update`, {
                lastThreadUpdateId,
                updates,
                authToken: document.authToken
            });
            return response.data;
        });
        this.user = user;
        this.networking = networking;
    }
    config() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.networking.get(`config`);
            return res.data;
        });
    }
    authChallenge() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.networking.post(`auth/challenge`, {});
            return res.data.nonce;
        });
    }
    authResponse(nonce, address, origin, signature) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.networking.post(`auth/response`, {
                nonce,
                address,
                origin,
                signature
            });
            return res.data.token;
        });
    }
    getAuthStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.networking.get(`auth/status`);
            return res.data;
        });
    }
    getLatestStateNoPendingOps() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield this.networking.post(`channel/${this.user}/latest-no-pending`,
                  { authToken: document.authToken });
                if (!res.data) {
                    return null;
                }
                return res.data;
            }
            catch (e) {
                if (e.status == 404) {
                    console.log(`Channel not found for user ${this.user}`);
                    return null;
                }
                console.log('Error getting latest state no pending ops:', e);
                throw e;
            }
        });
    }
    getLastThreadUpdateId() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield this.networking.post(`thread/${this.user}/last-update-id`,
                  { authToken: document.authToken });
                if (!res.data) {
                    return 0;
                }
                return res.data.latestThreadUpdateId;
            }
            catch (e) {
                if (e.status == 404) {
                    console.log(`Thread update not found for user ${this.user}`);
                    return 0;
                }
                console.log('Error getting latest state no pending ops:', e);
                throw e;
            }
        });
    }
    getLatestChannelStateAndUpdate() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('cookie', document.cookie)
                const res = yield this.networking.post(`channel/${this.user}/latest-update`,
                  { authToken: document.authToken });
                if (!res.data) {
                    return null;
                }
                return { state: res.data.state, update: types_1.channelUpdateToUpdateRequest(res.data) };
            }
            catch (e) {
                if (e.status == 404) {
                    console.log(`Channel not found for user ${this.user}`);
                    return null;
                }
                console.log('Error getting latest state:', e);
                throw e;
            }
        });
    }
    updateThread(update) {
        return __awaiter(this, void 0, void 0, function* () {
            // 'POST /:sender/to/:receiver/update': 'doUpdateThread'
            try {
                const res = yield this.networking.post(`thread/${update.state.sender}/to/${update.state.receiver}/update`, {
                    update,
                    authToken: document.authToken
                });
                return res.data;
            }
            catch (e) {
                if (e.statusCode === 404) {
                    throw new Error(`Thread not found for sender ${update.state.sender} and receiver ${update.state.receiver}`);
                }
                throw e;
            }
        });
    }
    getChannelByUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            // get the current channel state and return it
            try {
                const res = yield this.networking.get(`channel/${user}`);
                return res.data;
            }
            catch (e) {
                if (e.statusCode === 404) {
                    throw new Error(`Channel not found for user ${user}`);
                }
                throw e;
            }
        });
    }
    getChannel() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getChannelByUser(this.user);
        });
    }
    // return state at specified global nonce
    getChannelStateAtNonce(txCountGlobal) {
        return __awaiter(this, void 0, void 0, function* () {
            // get the channel state at specified nonce
            try {
                const response = yield this.networking.post(`channel/${this.user}/update/${txCountGlobal}`,
                  { authToken: document.authToken });
                return response.data;
            }
            catch (e) {
                throw new Error(`Cannot find update for user ${this.user} at nonce ${txCountGlobal}, ${e.toString()}`);
            }
        });
    }
    getThreadInitialStates() {
        return __awaiter(this, void 0, void 0, function* () {
            // get the current channel state and return it
            const response = yield this.networking.get(`thread/${this.user}/initial-states`);
            if (!response.data) {
                return [];
            }
            return response.data;
        });
    }
    getActiveThreads() {
        return __awaiter(this, void 0, void 0, function* () {
            // get the current channel state and return it
            const response = yield this.networking.post(`thread/${this.user}/active`,
              { authToken: document.authToken });
            if (!response.data) {
                return [];
            }
            return response.data;
        });
    }
    getAllThreads() {
        return __awaiter(this, void 0, void 0, function* () {
            // get the current channel state and return it
            const response = yield this.networking.post(`thread/${this.user}/all`,
              { authToken: document.authToken }
            );
            if (!response.data) {
                return [];
            }
            return response.data;
        });
    }
    getIncomingThreads() {
        return __awaiter(this, void 0, void 0, function* () {
            // get the current channel state and return it
            const response = yield this.networking.post(`thread/${this.user}/incoming`,
              { authToken: document.authToken }
            );
            if (!response.data) {
                return [];
            }
            return response.data;
        });
    }
    // return all threads between 2 addresses
    getThreadByParties(partyB, userIsSender) {
        return __awaiter(this, void 0, void 0, function* () {
            // get receiver threads
            const response = yield this.networking.get(`thread/${userIsSender ? this.user : partyB}/to/${userIsSender ? partyB : this.user}`);
            return response.data;
        });
    }
    // hits the hubs sync endpoint to return all actionable states
    sync(txCountGlobal, lastThreadUpdateId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield this.networking.post(`channel/${this.user}/sync?lastChanTx=${txCountGlobal}&lastThreadUpdateId=${lastThreadUpdateId}`,
                  { authToken: document.authToken });
                return res.data;
            }
            catch (e) {
                if (e.status === 404) {
                    return null;
                }
                throw e;
            }
        });
    }
    getExchangerRates() {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.networking.get('exchangeRate');
            return data.rates;
        });
    }
    buy(meta, payments) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = yield this.networking.post('payments/purchase',
                  { meta, payments,
                    authToken: document.authToken
                 });
                return data;
            }
            catch (e) {
                throw e;
            }
        });
    }
    redeem(secret, txCount, lastThreadUpdateId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.networking.post(`payments/redeem/${this.user}`, {
                    secret,
                    lastChanTx: txCount,
                    lastThreadUpdateId,
                });
                return response.data;
            }
            catch (e) {
                console.log(e.message);
                if (e.message.indexOf("Payment has been redeemed.") != -1) {
                    throw new Error(`Payment has been redeemed.`);
                }
                throw e;
            }
        });
    }
    requestExchange(weiToSell, tokensToSell, txCountGlobal) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.networking.post(`channel/${this.user}/request-exchange`,
              { weiToSell, tokensToSell, lastChanTx: txCountGlobal,
                authToken: document.authToken  });
            return data;
        });
    }
}
class IWeb3TxWrapper {
}
exports.IWeb3TxWrapper = IWeb3TxWrapper;
/**
 * A wrapper around the Web3 PromiEvent
 * (https://web3js.readthedocs.io/en/1.0/callbacks-promises-events.html#promievent)
 * that makes the different `await` behaviors explicit.
 *
 * For example:
 *
 *   > const tx = channelManager.userAuthorizedUpdate(...)
 *   > await tx.awaitEnterMempool()
 */
class Web3TxWrapper extends IWeb3TxWrapper {
    constructor(address, name, tx) {
        super();
        this.onTxHash = new utils_1.ResolveablePromise();
        this.onFirstConfirmation = new utils_1.ResolveablePromise();
        this.address = address;
        this.name = name;
        this.tx = tx;
        tx.once('transactionHash', (hash) => {
            console.log(`Sending ${this.name} to ${this.address}: in mempool: ${hash}`);
            this.onTxHash.resolve();
        });
        tx.once('confirmation', (confirmation, receipt) => {
            console.log(`Sending ${this.name} to ${this.address}: confirmed:`, receipt);
            this.onFirstConfirmation.resolve();
        });
    }
    awaitEnterMempool() {
        return this.onTxHash;
    }
    awaitFirstConfirmation() {
        return this.onFirstConfirmation;
    }
}
exports.Web3TxWrapper = Web3TxWrapper;
class ChannelManager {
    constructor(web3, address, gasMultiple) {
        this.address = address;
        this.cm = new web3.eth.Contract(ChannelManagerAbi_1.default.abi, address);
        this.gasMultiple = gasMultiple;
    }
    getPastEvents(user, eventName, fromBlock) {
        return __awaiter(this, void 0, void 0, function* () {
            const events = yield this.cm.getPastEvents(eventName, {
                filter: { user },
                fromBlock,
                toBlock: "latest",
            });
            return events;
        });
    }
    userAuthorizedUpdate(state) {
        return __awaiter(this, void 0, void 0, function* () {
            // deposit on the contract
            const call = this.cm.methods.userAuthorizedUpdate(state.recipient, // recipient
            [
                state.balanceWeiHub,
                state.balanceWeiUser,
            ], [
                state.balanceTokenHub,
                state.balanceTokenUser,
            ], [
                state.pendingDepositWeiHub,
                state.pendingWithdrawalWeiHub,
                state.pendingDepositWeiUser,
                state.pendingWithdrawalWeiUser,
            ], [
                state.pendingDepositTokenHub,
                state.pendingWithdrawalTokenHub,
                state.pendingDepositTokenUser,
                state.pendingWithdrawalTokenUser,
            ], [state.txCountGlobal, state.txCountChain], state.threadRoot, state.threadCount, state.timeout, state.sigHub);
            const sendArgs = {
                from: state.user,
                value: state.pendingDepositWeiUser,
            };
            const gasEstimate = yield call.estimateGas(sendArgs);
            sendArgs.gas = bn_1.toBN(Math.ceil(gasEstimate * this.gasMultiple));
            return new Web3TxWrapper(this.address, 'userAuthorizedUpdate', call.send(sendArgs));
        });
    }
    startExit(state) {
        return __awaiter(this, void 0, void 0, function* () {
            const call = this.cm.methods.startExit(state.user);
            const sendArgs = {
                from: state.user,
                value: 0,
            };
            const gasEstimate = yield call.estimateGas(sendArgs);
            sendArgs.gas = bn_1.toBN(gasEstimate * this.gasMultiple);
            return new Web3TxWrapper(this.address, 'startExit', call.send(sendArgs));
        });
    }
    startExitWithUpdate(state) {
        return __awaiter(this, void 0, void 0, function* () {
            const call = this.cm.methods.startExitWithUpdate([state.user, state.recipient], [
                state.balanceWeiHub,
                state.balanceWeiUser,
            ], [
                state.balanceTokenHub,
                state.balanceTokenUser,
            ], [
                state.pendingDepositWeiHub,
                state.pendingWithdrawalWeiHub,
                state.pendingDepositWeiUser,
                state.pendingWithdrawalWeiUser,
            ], [
                state.pendingDepositTokenHub,
                state.pendingWithdrawalTokenHub,
                state.pendingDepositTokenUser,
                state.pendingWithdrawalTokenUser,
            ], [state.txCountGlobal, state.txCountChain], state.threadRoot, state.threadCount, state.timeout, state.sigHub, state.sigUser);
            const sendArgs = {
                from: state.user,
                value: 0,
            };
            const gasEstimate = yield call.estimateGas(sendArgs);
            sendArgs.gas = bn_1.toBN(gasEstimate * this.gasMultiple);
            return new Web3TxWrapper(this.address, 'startExitWithUpdate', call.send(sendArgs));
        });
    }
    emptyChannelWithChallenge(state) {
        return __awaiter(this, void 0, void 0, function* () {
            const call = this.cm.methods.emptyChannelWithChallenge([state.user, state.recipient], [
                state.balanceWeiHub,
                state.balanceWeiUser,
            ], [
                state.balanceTokenHub,
                state.balanceTokenUser,
            ], [
                state.pendingDepositWeiHub,
                state.pendingWithdrawalWeiHub,
                state.pendingDepositWeiUser,
                state.pendingWithdrawalWeiUser,
            ], [
                state.pendingDepositTokenHub,
                state.pendingWithdrawalTokenHub,
                state.pendingDepositTokenUser,
                state.pendingWithdrawalTokenUser,
            ], [state.txCountGlobal, state.txCountChain], state.threadRoot, state.threadCount, state.timeout, state.sigHub, state.sigUser);
            const sendArgs = {
                from: state.user,
                value: 0,
            };
            const gasEstimate = yield call.estimateGas(sendArgs);
            sendArgs.gas = bn_1.toBN(gasEstimate * this.gasMultiple);
            return new Web3TxWrapper(this.address, 'emptyChannelWithChallenge', call.send(sendArgs));
        });
    }
    emptyChannel(state) {
        return __awaiter(this, void 0, void 0, function* () {
            const call = this.cm.methods.emptyChannel(state.user);
            const sendArgs = {
                from: state.user,
                value: 0,
            };
            const gasEstimate = yield call.estimateGas(sendArgs);
            sendArgs.gas = bn_1.toBN(gasEstimate * this.gasMultiple);
            return new Web3TxWrapper(this.address, 'emptyChannel', call.send(sendArgs));
        });
    }
    startExitThread(state, threadState, proof) {
        return __awaiter(this, void 0, void 0, function* () {
            const call = this.cm.methods.startExitThread(state.user, threadState.sender, threadState.receiver, threadState.threadId, [threadState.balanceWeiSender, threadState.balanceWeiReceiver], [threadState.balanceTokenSender, threadState.balanceTokenReceiver], proof, threadState.sigA);
            const sendArgs = {
                from: state.user,
                value: 0,
            };
            const gasEstimate = yield call.estimateGas(sendArgs);
            sendArgs.gas = bn_1.toBN(gasEstimate * this.gasMultiple);
            return new Web3TxWrapper(this.address, 'startExitThread', call.send(sendArgs));
        });
    }
    startExitThreadWithUpdate(state, threadInitialState, threadUpdateState, proof) {
        return __awaiter(this, void 0, void 0, function* () {
            const call = this.cm.methods.startExitThreadWithUpdate(state.user, [threadInitialState.sender, threadInitialState.receiver], threadInitialState.threadId, [threadInitialState.balanceWeiSender, threadInitialState.balanceWeiReceiver], [threadInitialState.balanceTokenSender, threadInitialState.balanceTokenReceiver], proof, threadInitialState.sigA, [threadUpdateState.balanceWeiSender, threadUpdateState.balanceWeiReceiver], [threadUpdateState.balanceTokenSender, threadUpdateState.balanceTokenReceiver], threadUpdateState.txCount, threadUpdateState.sigA);
            const sendArgs = {
                from: state.user,
                value: 0,
            };
            const gasEstimate = yield call.estimateGas(sendArgs);
            sendArgs.gas = bn_1.toBN(gasEstimate * this.gasMultiple);
            return new Web3TxWrapper(this.address, 'startExitThreadWithUpdate', call.send(sendArgs));
        });
    }
    challengeThread(state, threadState) {
        return __awaiter(this, void 0, void 0, function* () {
            const call = this.cm.methods.challengeThread(threadState.sender, threadState.receiver, threadState.threadId, [threadState.balanceWeiSender, threadState.balanceWeiReceiver], [threadState.balanceTokenSender, threadState.balanceTokenReceiver], threadState.txCount, threadState.sigA);
            const sendArgs = {
                from: state.user,
                value: 0,
            };
            const gasEstimate = yield call.estimateGas(sendArgs);
            sendArgs.gas = bn_1.toBN(gasEstimate * this.gasMultiple);
            return new Web3TxWrapper(this.address, 'challengeThread', call.send(sendArgs));
        });
    }
    emptyThread(state, threadState, proof) {
        return __awaiter(this, void 0, void 0, function* () {
            const call = this.cm.methods.emptyThread(state.user, threadState.sender, threadState.receiver, threadState.threadId, [threadState.balanceWeiSender, threadState.balanceWeiReceiver], [threadState.balanceTokenSender, threadState.balanceTokenReceiver], proof, threadState.sigA);
            const sendArgs = {
                from: state.user,
                value: 0,
            };
            const gasEstimate = yield call.estimateGas(sendArgs);
            sendArgs.gas = bn_1.toBN(gasEstimate * this.gasMultiple);
            return new Web3TxWrapper(this.address, 'emptyThread', call.send(sendArgs));
        });
    }
    nukeThreads(state) {
        return __awaiter(this, void 0, void 0, function* () {
            const call = this.cm.methods.nukeThreads(state.user);
            const sendArgs = {
                from: state.user,
                value: 0,
            };
            const gasEstimate = yield call.estimateGas(sendArgs);
            sendArgs.gas = bn_1.toBN(gasEstimate * this.gasMultiple);
            return new Web3TxWrapper(this.address, 'nukeThreads', call.send(sendArgs));
        });
    }
    getChannelDetails(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.cm.methods.getChannelDetails(user).call({ from: user });
            return {
                txCountGlobal: +res[0],
                txCountChain: +res[1],
                threadRoot: res[2],
                threadCount: +res[3],
                exitInitiator: res[4],
                channelClosingTime: +res[5],
                status: res[6],
            };
        });
    }
}
exports.ChannelManager = ChannelManager;
function hubConfigToClientOpts(config) {
    return {
        contractAddress: config.channelManagerAddress.toLowerCase(),
        hubAddress: config.hubWalletAddress.toLowerCase(),
        tokenAddress: config.tokenAddress.toLowerCase(),
        ethNetworkId: config.ethNetworkId.toLowerCase(),
    };
}
/**
 * Used to get an instance of ConnextClient.
 */
function getConnextClient(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        // create a new hub and pass into the client
        let hub = opts.hub;
        if (!hub) {
            hub = new HubAPIClient(opts.user, new networking_1.Networking(opts.hubUrl));
        }
        const hubOpts = hubConfigToClientOpts(yield hub.config());
        let merged = Object.assign({}, opts);
        for (let k in hubOpts) {
            if (opts[k]) {
                continue;
            }
            merged[k] = hubOpts[k];
        }
        return new ConnextInternal(Object.assign({}, merged));
    });
}
exports.getConnextClient = getConnextClient;
/**
 * The external interface to the Connext client, used by the Wallet.
 *
 * Create an instance with:
 *
 *  > const client = getConnextClient({...})
 *  > client.start() // start polling
 *  > client.on('onStateChange', state => {
 *  .   console.log('Connext state changed:', state)
 *  . })
 *
 */
class ConnextClient extends events_1.EventEmitter {
    constructor(opts) {
        super();
        this.opts = opts;
        this.internal = this;
    }
    /**
     * Starts the stateful portions of the Connext client.
     *
     * Note: the full implementation lives in ConnextInternal.
     */
    start() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    /**
     * Stops the stateful portions of the Connext client.
     *
     * Note: the full implementation lives in ConnextInternal.
     */
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    deposit(payment) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.internal.depositController.requestUserDeposit(payment);
        });
    }
    exchange(toSell, currency) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.internal.exchangeController.exchange(toSell, currency);
        });
    }
    buy(purchase) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.internal.buyController.buy(purchase);
        });
    }
    withdraw(withdrawal) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.internal.withdrawalController.requestUserWithdrawal(withdrawal);
        });
    }
    requestCollateral() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.internal.collateralController.requestCollateral();
        });
    }
    redeem(secret) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.internal.redeemController.redeem(secret);
        });
    }
}
exports.ConnextClient = ConnextClient;
/**
 * The "actual" implementation of the Connext client. Internal components
 * should use this type, as it provides access to the various controllers, etc.
 */
class ConnextInternal extends ConnextClient {
    constructor(opts) {
        super(opts);
        this.utils = new Utils_1.Utils();
        this._latestState = null;
        this._saving = Promise.resolve();
        this._savePending = false;
        // Internal things
        // The store shouldn't be used by anything before calling `start()`, so
        // leave it null until then.
        this.store = null;
        console.log('Using hub', opts.hub ? 'provided by caller' : `at ${this.opts.hubUrl}`);
        this.hub = opts.hub || new HubAPIClient(this.opts.user, new networking_1.Networking(this.opts.hubUrl), this.opts.tokenName);
        opts.user = opts.user.toLowerCase();
        opts.hubAddress = opts.hubAddress.toLowerCase();
        opts.contractAddress = opts.contractAddress.toLowerCase();
        this.validator = new validator_1.Validator(opts.web3, opts.hubAddress);
        this.contract = opts.contract || new ChannelManager(opts.web3, opts.contractAddress, opts.gasMultiple || 1.5);
        // Controllers
        this.exchangeController = new ExchangeController_1.ExchangeController('ExchangeController', this);
        this.syncController = new SyncController_1.default('SyncController', this);
        this.depositController = new DepositController_1.default('DepositController', this);
        this.buyController = new BuyController_1.default('BuyController', this);
        this.withdrawalController = new WithdrawalController_1.default('WithdrawalController', this);
        this.stateUpdateController = new StateUpdateController_1.default('StateUpdateController', this);
        this.collateralController = new CollateralController_1.default('CollateralController', this);
        this.threadsController = new ThreadsController_1.default('ThreadsController', this);
        this.redeemController = new RedeemController_1.RedeemController('RedeemController', this);
    }
    getControllers() {
        const res = [];
        for (let key of Object.keys(this)) {
            const val = this[key];
            const isController = (val &&
                utils_1.isFunction(val['start']) &&
                utils_1.isFunction(val['stop']) &&
                val !== this);
            if (isController)
                res.push(val);
        }
        return res;
    }
    withdrawal(params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.withdrawalController.requestUserWithdrawal(params);
        });
    }
    auth(origin) {
        return __awaiter(this, void 0, void 0, function* () {
            // check the status, return if already authed
            const status = yield this.hub.getAuthStatus();
            if (status.success && status.address && status.address == this.opts.user) {
                // TODO: what if i want to get this cookie?
                console.log('address already authed');
                return null;
            }
            // first get the nonce
            const nonce = yield this.hub.authChallenge();
            // create hash and sign
            const preamble = "SpankWallet authentication message:";
            const web3 = this.opts.web3;
            const hash = web3.utils.sha3(`${preamble} ${web3.utils.sha3(nonce)} ${web3.utils.sha3(origin)}`);
            const signature = yield web3.eth.personal.sign(hash, this.opts.user);
            // return to hub
            const auth = yield this.hub.authResponse(nonce, this.opts.user, origin, signature);
            const cookie = `hub.sid=${auth}`;
            document.cookie = cookie;
            document.authToken = auth;
            return null;
        });
    }
    recipientNeedsCollateral(recipient, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            // get recipients channel
            let channel;
            try {
                channel = yield this.hub.getChannelByUser(recipient);
            }
            catch (e) {
                if (e.status == 404) {
                    return `Recipient channel does not exist. Recipient: ${recipient}.`;
                }
                throw e;
            }
            // check if hub can afford payment
            const chanBN = types_1.convertChannelState("bn", channel.state);
            const amtBN = types_1.convertPayment("bn", amount);
            if (chanBN.balanceWeiHub.lt(amtBN.amountWei) || chanBN.balanceTokenHub.lt(amtBN.amountToken)) {
                return `Recipient needs collateral to facilitate payment.`;
            }
            // otherwise, no collateral is needed to make payment
            return null;
        });
    }
    syncConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            const config = yield this.hub.config();
            const opts = this.opts;
            const adjusted = Object.keys(opts).map(k => {
                if (k || Object.keys(opts).indexOf(k) == -1) {
                    // user supplied, igonore
                    return opts[k];
                }
                return config[k];
            });
            return adjusted;
        });
    }
    start() {
        const _super = Object.create(null, {
            start: { get: () => super.start }
        });
        return __awaiter(this, void 0, void 0, function* () {
            this.store = yield this.getStore();
            this.store.subscribe(() => __awaiter(this, void 0, void 0, function* () {
                const state = this.store.getState();
                this.emit('onStateChange', state);
                yield this._saveState(state);
            }));
            // before starting controllers, sync values
            yield this.syncConfig();
            // also auth
            const authRes = yield this.auth(this.opts.origin);
            if (authRes) {
                console.warn('Error authing, cannot start');
                return;
            }
            // TODO: appropriately set the latest
            // valid state ??
            const channelAndUpdate = yield this.hub.getLatestChannelStateAndUpdate();
            console.log('Found latest double signed state:', JSON.stringify(channelAndUpdate, null, 2));
            if (channelAndUpdate) {
                this.store.dispatch(actions.setChannelAndUpdate(channelAndUpdate));
                // update the latest valid state
                const latestValid = yield this.hub.getLatestStateNoPendingOps();
                console.log('latestValid:', latestValid);
                if (latestValid) {
                    this.store.dispatch(actions.setLatestValidState(latestValid));
                }
                // unconditionally update last thread update id, thread history
                const lastThreadUpdateId = yield this.hub.getLastThreadUpdateId();
                console.log('lastThreadUpdateId:', lastThreadUpdateId);
                this.store.dispatch(actions.setLastThreadUpdateId(lastThreadUpdateId));
                // extract thread history, sort by descending threadId
                const threadHistoryDuplicates = (yield this.hub.getAllThreads()).map(t => {
                    return {
                        sender: t.sender,
                        receiver: t.receiver,
                        threadId: t.threadId,
                    };
                }).sort((a, b) => b.threadId - a.threadId);
                console.log('threadHistoryDuplicates', threadHistoryDuplicates);
                // filter duplicates
                const threadHistory = threadHistoryDuplicates.filter((thread, i) => {
                    const search = JSON.stringify({
                        sender: thread.sender,
                        receiver: thread.receiver
                    });
                    const elts = threadHistoryDuplicates.map(t => {
                        return JSON.stringify({ sender: t.sender, receiver: t.receiver });
                    });
                    return elts.indexOf(search) == i;
                });
                console.log('threadHistory:', threadHistory);
                this.store.dispatch(actions.setThreadHistory(threadHistory));
                // if thread count is greater than 0, update
                // activeThreads, initial states
                if (channelAndUpdate.state.threadCount > 0) {
                    const initialStates = yield this.hub.getThreadInitialStates();
                    console.log('initialStates:', initialStates);
                    this.store.dispatch(actions.setActiveInitialThreadStates(initialStates));
                    const threadRows = yield this.hub.getActiveThreads();
                    console.log('threadRows:', threadRows);
                    this.store.dispatch(actions.setActiveThreads(threadRows));
                }
            }
            // Start all controllers
            for (let controller of this.getControllers()) {
                console.log('Starting:', controller.name);
                yield controller.start();
                console.log('Done!', controller.name, 'started.');
            }
            yield _super.start.call(this);
        });
    }
    stop() {
        const _super = Object.create(null, {
            stop: { get: () => super.stop }
        });
        return __awaiter(this, void 0, void 0, function* () {
            // Stop all controllers
            for (let controller of this.getControllers())
                yield controller.stop();
            yield _super.stop.call(this);
        });
    }
    dispatch(action) {
        this.store.dispatch(action);
    }
    generateSecret() {
        return Web3.utils.soliditySha3({
            type: 'bytes32', value: Web3.utils.randomHex(32)
        });
    }
    sign(hash, user) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (this.opts.web3.eth.personal
                ? this.opts.web3.eth.personal.sign(hash, user)
                : this.opts.web3.eth.sign(hash, user));
        });
    }
    signChannelState(state) {
        return __awaiter(this, void 0, void 0, function* () {
            if (state.user.toLowerCase() != this.opts.user.toLowerCase() ||
                state.contractAddress.toLowerCase() != this.opts.contractAddress.toLowerCase()) {
                throw new Error(`Refusing to sign channel state update which changes user or contract: ` +
                    `expected user: ${this.opts.user}, expected contract: ${this.opts.contractAddress} ` +
                    `actual state: ${JSON.stringify(state)}`);
            }
            const hash = this.utils.createChannelStateHash(state);
            const { user, hubAddress } = this.opts;
            const sig = yield this.sign(hash, user);
            console.log(`Signing channel state ${state.txCountGlobal}: ${sig}`, state);
            return types_2.addSigToChannelState(state, sig, true);
        });
    }
    signThreadState(state) {
        return __awaiter(this, void 0, void 0, function* () {
            const userInThread = state.sender == this.opts.user || state.receiver == this.opts.user;
            if (!userInThread ||
                state.contractAddress != this.opts.contractAddress) {
                throw new Error(`Refusing to sign thread state update which changes user or contract: ` +
                    `expected user: ${this.opts.user}, expected contract: ${this.opts.contractAddress} ` +
                    `actual state: ${JSON.stringify(state)}`);
            }
            const hash = this.utils.createThreadStateHash(state);
            const sig = yield this.sign(hash, this.opts.user);
            console.log(`Signing thread state ${state.txCount}: ${sig}`, state);
            return types_1.addSigToThreadState(state, sig);
        });
    }
    signDepositRequestProposal(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const hash = this.utils.createDepositRequestProposalHash(args);
            const sig = yield this.sign(hash, this.opts.user);
            console.log(`Signing deposit request ${JSON.stringify(args, null, 2)}. Sig: ${sig}`);
            return Object.assign({}, args, { sigUser: sig });
        });
    }
    getContractEvents(eventName, fromBlock) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.contract.getPastEvents(this.opts.user, eventName, fromBlock);
        });
    }
    _saveState(state) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.opts.saveState)
                return;
            if (this._latestState === state.persistent)
                return;
            this._latestState = state.persistent;
            if (this._savePending)
                return;
            this._savePending = true;
            this._saving = new Promise((res, rej) => {
                // Only save the state after all the currently pending operations have
                // completed to make sure that subsequent state updates will be atomic.
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    let err = null;
                    try {
                        yield this._saveLoop();
                    }
                    catch (e) {
                        err = e;
                    }
                    // Be sure to set `_savePending` to `false` before resolve/reject
                    // in case the state changes during res()/rej()
                    this._savePending = false;
                    return err ? rej(err) : res();
                }), 1);
            });
        });
    }
    /**
     * Because it's possible that the state will continue to be updated while
     * a previous state is saving, loop until the state doesn't change while
     * it's being saved before we return.
     */
    _saveLoop() {
        return __awaiter(this, void 0, void 0, function* () {
            let result = null;
            while (true) {
                const state = this._latestState;
                result = this.opts.saveState(JSON.stringify(state));
                // Wait for any current save to finish, but ignore any error it might raise
                const [timeout, _] = yield utils_1.timeoutPromise(result.then(null, () => null), 10 * 1000);
                if (timeout) {
                    console.warn('Timeout (10 seconds) while waiting for state to save. ' +
                        'This error will be ignored (which may cause data loss). ' +
                        'User supplied function that has not returned:', this.opts.saveState);
                }
                if (this._latestState == state)
                    break;
            }
        });
    }
    /**
     * Waits for any persistent state to be saved.
     *
     * If the save fails, the promise will reject.
     */
    awaitPersistentStateSaved() {
        return this._saving;
    }
    getStore() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.opts.store)
                return this.opts.store;
            const state = new store_1.ConnextState();
            state.persistent.channel = Object.assign({}, state.persistent.channel, { contractAddress: this.opts.contractAddress || '', user: this.opts.user, recipient: this.opts.user });
            state.persistent.latestValidState = state.persistent.channel;
            if (this.opts.loadState) {
                const loadedState = yield this.opts.loadState();
                if (loadedState)
                    state.persistent = JSON.parse(loadedState);
            }
            return redux_1.createStore(reducers_1.reducers, state, redux_1.applyMiddleware(middleware_1.handleStateFlags));
        });
    }
    getLogger(name) {
        return {
            source: name,
            logToApi(...args) {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log(`${name}:`, ...args);
                });
            },
        };
    }
}
exports.ConnextInternal = ConnextInternal;
//# sourceMappingURL=Connext.js.map
