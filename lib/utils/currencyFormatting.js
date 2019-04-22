"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getChannelBalanceInUSD = getChannelBalanceInUSD;
exports.getAmountInUSD = getAmountInUSD;
exports.getBalanceEth = getBalanceEth;
exports.getBalanceToken = getBalanceToken;

var _CurrencyConvertable = require("connext/dist/lib/currency/CurrencyConvertable");

var _CurrencyConvertable2 = _interopRequireDefault(_CurrencyConvertable);

var _CurrencyTypes = require("connext/dist/state/ConnextState/CurrencyTypes");

var _getExchangeRates = require("connext/dist/lib/getExchangeRates");

var _getExchangeRates2 = _interopRequireDefault(_getExchangeRates);

var _Currency = require("connext/dist/lib/currency/Currency");

var _Currency2 = _interopRequireDefault(_Currency);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getChannelBalanceInUSD(channelState, connextState) {
  var onlyTokens = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  if (!connextState || !channelState) {
    return "$0.00";
  }

  var convertableTokens = new _CurrencyConvertable2.default(_CurrencyTypes.CurrencyType.BEI, channelState.balanceTokenUser, function () {
    return (0, _getExchangeRates2.default)(connextState);
  });

  if (onlyTokens) {
    return _Currency2.default.USD(convertableTokens.toUSD().amountBigNumber).format({});
  }

  var convertableWei = new _CurrencyConvertable2.default(_CurrencyTypes.CurrencyType.WEI, channelState.balanceWeiUser, function () {
    return (0, _getExchangeRates2.default)(connextState);
  });

  console.log('total:', convertableTokens.toBEI().amountBigNumber.plus(convertableWei.toBEI().amountBigNumber).toFixed(0));

  var total = new _CurrencyConvertable2.default(_CurrencyTypes.CurrencyType.BEI, convertableTokens.toBEI().amountBigNumber.plus(convertableWei.toBEI().amountBigNumber), function () {
    return (0, _getExchangeRates2.default)(connextState);
  }).toUSD().amountBigNumber;

  return _Currency2.default.USD(total).format({});
}

function getAmountInUSD(amount, connextState) {
  var onlyTokens = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  if (!connextState || !amount) {
    return "$0.00";
  }
  var convertableTokens = new _CurrencyConvertable2.default(_CurrencyTypes.CurrencyType.BEI, amount.amountToken, function () {
    return (0, _getExchangeRates2.default)(connextState);
  });

  if (onlyTokens) {
    return _Currency2.default.USD(convertableTokens.toUSD().amountBigNumber).format({});
  }

  var convertableWei = new _CurrencyConvertable2.default(_CurrencyTypes.CurrencyType.WEI, amount.amountWei, function () {
    return (0, _getExchangeRates2.default)(connextState);
  });

  var totalBalance = _Currency2.default.USD(convertableTokens.toBEI().amountBigNumber.plus(convertableWei.toBEI)).format({});

  return totalBalance;
}

function getBalanceEth(amount, connextState) {
  if (!amount || !connextState) {
    return "$0.00";
  }

  var balance = new _CurrencyConvertable2.default(_CurrencyTypes.CurrencyType.WEI, amount, function () {
    return (0, _getExchangeRates2.default)(connextState);
  });

  var totalBalance = _Currency2.default.ETH(balance.toETH().amountBigNumber).format({});

  return totalBalance;
}

function getBalanceToken(amount, connextState) {
  if (!amount || !connextState) {
    return "$0.00";
  }

  var balance = new _CurrencyConvertable2.default(_CurrencyTypes.CurrencyType.BEI, amount, function () {
    return (0, _getExchangeRates2.default)(connextState);
  });

  var totalBalance = _Currency2.default.BOOTY(balance.toBOOTY().amountBigNumber).format({});

  return totalBalance;
}