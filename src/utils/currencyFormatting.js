import CurrencyConvertable from "connext/dist/lib/currency/CurrencyConvertable";
import { CurrencyType } from "connext/dist/state/ConnextState/CurrencyTypes";
import getExchangeRates from "connext/dist/lib/getExchangeRates";
import Currency from "connext/dist/lib/currency/Currency";

export function getChannelBalanceInUSD(channelState, connextState, onlyTokens = true) {
  if (!connextState || !channelState) {
    return "$0.00"
  }

  const convertableTokens = new CurrencyConvertable(CurrencyType.BEI, channelState.balanceTokenUser, () => getExchangeRates(connextState))

  if (onlyTokens) {
    return Currency.USD(convertableTokens.toUSD().amountBigNumber).format({})
  }

  const convertableWei = new CurrencyConvertable(CurrencyType.WEI, channelState.balanceWeiUser, () => getExchangeRates(connextState))

  console.log('total:', convertableTokens.toBEI().amountBigNumber.plus(convertableWei.toBEI().amountBigNumber).toFixed(0))

  const total = new CurrencyConvertable(
    CurrencyType.BEI,
    convertableTokens.toBEI().amountBigNumber.plus(convertableWei.toBEI().amountBigNumber),
    () => getExchangeRates(connextState)
  ).toUSD().amountBigNumber

  return  Currency.USD(total).format({})
}

export function getAmountInUSD(amount, connextState, onlyTokens = true) {
  if (!connextState || !amount) {
    return "$0.00"
  }
  const convertableTokens = new CurrencyConvertable(CurrencyType.BEI, amount.amountToken, () => getExchangeRates(connextState))

  if (onlyTokens) {
    return Currency.USD(convertableTokens.toUSD().amountBigNumber).format({})
  }

  const convertableWei = new CurrencyConvertable(CurrencyType.WEI, amount.amountWei, () => getExchangeRates(connextState))

  const totalBalance = Currency.USD(
    convertableTokens.toBEI().amountBigNumber.plus(convertableWei.toBEI)
  ).format({})

  return totalBalance
}

export function getBalanceEth(amount, connextState) {
  if (!amount || !connextState) {
    return "$0.00"
  }

  const balance = new CurrencyConvertable(CurrencyType.WEI, amount, () => getExchangeRates(connextState))

  const totalBalance = Currency.ETH(
    balance.toETH().amountBigNumber
  ).format({})

  return totalBalance
}

export function getBalanceToken(amount, connextState) {
  if (!amount || !connextState) {
    return "$0.00"
  }

  const balance = new CurrencyConvertable(CurrencyType.BEI, amount, () => getExchangeRates(connextState))

  const totalBalance = Currency.BOOTY(
    balance.toBOOTY().amountBigNumber
  ).format({})

  return totalBalance
}
