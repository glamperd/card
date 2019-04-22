"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var ProviderEngine = require('web3-provider-engine');
var DefaultFixture = require('web3-provider-engine/subproviders/default-fixture');
var NonceTrackerSubprovider = require('web3-provider-engine/subproviders/nonce-tracker');
var CacheSubprovider = require('web3-provider-engine/subproviders/cache');
var FilterSubprovider = require('web3-provider-engine/subproviders/filters');
var InflightCacheSubprovider = require('web3-provider-engine/subproviders/inflight-cache');
var HookedWalletSubprovider = require('web3-provider-engine/subproviders/hooked-wallet');
var SanitizingSubprovider = require('web3-provider-engine/subproviders/sanitizer');
var FetchSubprovider = require('web3-provider-engine/subproviders/fetch');
var GaspriceSubprovider_1 = require("./GaspriceSubprovider");
function clientProvider(opts) {
    opts = opts || {};
    var engine = new ProviderEngine(opts.engineParams);
    // static
    var staticSubprovider = new DefaultFixture(opts.static);
    engine.addProvider(staticSubprovider);
    // nonce tracker
    engine.addProvider(new NonceTrackerSubprovider());
    // sanitization
    var sanitizer = new SanitizingSubprovider();
    engine.addProvider(sanitizer);
    // cache layer
    var cacheSubprovider = new CacheSubprovider();
    engine.addProvider(cacheSubprovider);
    // filters
    var filterSubprovider = new FilterSubprovider();
    engine.addProvider(filterSubprovider);
    // inflight cache
    var inflightCache = new InflightCacheSubprovider();
    engine.addProvider(inflightCache);
    var gasprice = new GaspriceSubprovider_1["default"](opts.hubUrl);
    engine.addProvider(gasprice);
    var idmgmtSubprovider = new HookedWalletSubprovider(__assign({}, opts));
    engine.addProvider(idmgmtSubprovider);
    // data source
    var dataSubprovider = opts.dataSubprovider || new FetchSubprovider({
        rpcUrl: opts.rpcUrl,
        originHttpHeaderKey: opts.originHttpHeaderKey
    });
    engine.addProvider(dataSubprovider);
    // start polling
    engine.start();
    // web3 uses the presence of an 'on' method to determine
    // if it should connect via web sockets. we create the
    // below proxy method in order to avoid this issue.
    return {
        start: engine.start.bind(engine),
        stop: engine.stop.bind(engine),
        send: engine.send.bind(engine),
        sendAsync: engine.sendAsync.bind(engine)
    };
}
exports["default"] = clientProvider;
