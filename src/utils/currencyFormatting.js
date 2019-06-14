import * as Connext from "connext";
import { ethers as eth } from 'ethers'

const { formatEther } = eth.utils
const { getExchangeRates, getCustodialAndChannelBalance } = new Connext.Utils()

export function getOwedBalanceInDAI(connextState, onlyTokens = true) {
  if (!connextState || JSON.stringify(getExchangeRates(connextState)) === '{}') {
    return "0.00"
  }
  const rateGetter = () => getExchangeRates(connextState)
  const totalOwed = getCustodialAndChannelBalance(connextState)
  const tokensOwed = Connext.Currency.DEI(totalOwed.amountToken, rateGetter)
  if (onlyTokens) {
    return tokensOwed.toDAI().format({ withSymbol: false })
  }
  const weiOwed = Connext.Currency.WEI(totalOwed.amountWei, rateGetter)
  const totalAmount = formatEther(weiOwed.amountWad.add(tokensOwed.toWEI().amountWad))
  const total = Connext.Currency.WEI(totalAmount, rateGetter)
  return total.toDAI().format({ withSymbol: false })
}

export function getAmountInDAI(amounts, connextState, onlyTokens = true) {
  if (!amounts || !connextState || JSON.stringify(getExchangeRates(connextState)) === '{}') {
    return "0.00"
  }
  const rateGetter = () => getExchangeRates(connextState)
  const tokenAmount = Connext.Currency.DEI(amounts.amountToken, rateGetter)
  if (onlyTokens) {
    return tokenAmount.toDAI().format({ withSymbol: false })
  }
  const weiAmount = Connext.Currency.WEI(amounts.amountWei, rateGetter)
  const totalWei = formatEther(weiAmount.amountWad.add(tokenAmount.toWEI().amountWad))
  const totalAmount = Connext.Currency.WEI(totalWei, rateGetter).toDAI()
  return totalAmount.format({ withSymbol: false })
}

export function getBalanceEth(amount, connextState) {
  if (!amount || !connextState) {
    return "$0.00"
  }

  const balance = Connext.Currency.DEI( amount, () => getExchangeRates(connextState))

  const totalBalance = Connext.Currency.ETH(
    balance.toETH().amountBigNumber
  ).format({})

  return totalBalance
}

export function getBalanceToken(amount, connextState) {
  if (!amount || !connextState) {
    return "$0.00"
  }

  const balance = Connext.Currency.DEI(amount, () => getExchangeRates(connextState))

  const totalBalance = Connext.Currency.BOOTY(
    balance.toBOOTY().amountBigNumber
  ).format({})

  return totalBalance
}
