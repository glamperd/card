"use strict";
exports.__esModule = true;
var ethUtil = require("ethereumjs-util");
var sigUtil = require("eth-sig-util");
var ethereumjs_tx_1 = require("ethereumjs-tx");
var buffer_1 = require("buffer");
require("dotenv").config();
var ProviderOptions = /** @class */ (function () {
    function ProviderOptions(store, rpcUrl, hubUrl) {
        var _this = this;
        this.getAccounts = function (callback) {
            var state = _this.store.getState();
            console.log('providerOptions ', state);
            var addr = state[0] ? state[0].getAddressString() : null;
            callback(null, addr ? [addr] : []);
        };
        this.approveTransactionAlways = function (txParams, callback) {
            callback(null, true);
        };
        this.signTransaction = function (rawTx, callback) {
            var key = _this.getPrivateKey();
            if (!key) {
                return callback("Wallet is locked.");
            }
            var tx = new ethereumjs_tx_1(rawTx);
            tx.sign(key);
            var txHex = "0x" + buffer_1.Buffer.from(tx.serialize()).toString("hex");
            callback(null, txHex);
        };
        this.signMessageAlways = function (messageParams, callback) {
            var key = _this.getPrivateKey();
            if (!key) {
                return callback("Wallet is locked.");
            }
            var msg = messageParams.data;
            var hashBuf = new buffer_1.Buffer(msg.split("x")[1], "hex");
            var prefix = new buffer_1.Buffer("\x19Ethereum Signed Message:\n");
            var buf = buffer_1.Buffer.concat([
                prefix,
                new buffer_1.Buffer(String(hashBuf.length)),
                hashBuf
            ]);
            var data = ethUtil.sha3(buf);
            var msgSig = ethUtil.ecsign(data, key);
            var rawMsgSig = ethUtil.bufferToHex(sigUtil.concatSig(msgSig.v, msgSig.r, msgSig.s));
            callback(null, rawMsgSig);
        };
        this.approving = function () {
            return {
                static: {
                    eth_syncing: false,
                    web3_clientVersion: "LiteratePayments/v" + 1.0
                },
                rpcUrl: _this.rpcUrl,
                hubUrl: _this.hubUrl,
                getAccounts: _this.getAccounts,
                approveTransaction: _this.approveTransactionAlways,
                signTransaction: _this.signTransaction,
                signMessage: _this.signMessageAlways,
                signPersonalMessage: _this.signMessageAlways
            };
        };
        //likely needs updates
        this.getPrivateKey = function () {
            var state = _this.store.getState();
            return state[0] ? state[0].getPrivateKey() : null;
        };
        this.getPublicKey = function () {
            var state = _this.store.getState();
            return state[0] ? state[0].getAddressString() : null;
        };
        this.store = store;
        this.rpcUrl = rpcUrl;
        this.hubUrl = hubUrl;
    }
    return ProviderOptions;
}());
exports["default"] = ProviderOptions;
