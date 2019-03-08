import CurrencyConvertable from "connext/dist/lib/currency/CurrencyConvertable";
import { CurrencyType } from "connext/dist/state/ConnextState/CurrencyTypes";
import getExchangeRates from "connext/dist/lib/getExchangeRates";
import Currency from "connext/dist/lib/currency/Currency";

export function getChannelBalanceInUSD(channelState, connextState, onlyTokens = true) {
  if (onlyTokens) {
    return Currency.USD(channelState.balanceTokenUser).format({})
  }

  const convertableTokens = new CurrencyConvertable(CurrencyType.BEI, channelState.balanceTokenUser, () => getExchangeRates(connextState))

  const convertableWei = new CurrencyConvertable(CurrencyType.WEI, channelState.balanceWeiUser, () => getExchangeRates(connextState))

  const totalBalance = Currency.USD(
    convertableTokens.toBEI().amountBigNumber.plus(convertableWei.toBEI)
  ).format({})

  return totalBalance
}
