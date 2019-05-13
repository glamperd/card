import * as Connext from 'connext';
const { Big, minBN } = Connext.big
import requestJson from './request';

export const Subprovider = require('web3-provider-engine/subproviders/subprovider')

const GWEI = Big('1000000000')
const MAX_PRICE = GWEI.mul(50)

interface Transaction {
  gasPrice: string
}

export default class GaspriceSubprovider extends Subprovider {
  constructor(hubUrl: string) {
    super()
    this.hubUrl = hubUrl
  }

  handleRequest(payload: any, next: () => void, end: (err: any, res?: any) => void) {
    if (payload.method !== 'eth_gasPrice') {
      return next()
    }

    this.estimateGasPriceFromHub()
      .catch(err => {
        console.warn('Error fetching gas price from the hub (falling back to Web3):', err)
        return null
      })
      .then(gasPrice => {
        if (!gasPrice)
          return this.estimateGasPriceFromPreviousBlocks()
        return gasPrice
      })
      .then(
        gasPrice => end(null, `0x${gasPrice.toString()}`),
        err => end(err)
      )
  }

  private async estimateGasPriceFromHub () {
    const res = await requestJson<any>(`${this.hubUrl}/gasPrice/estimate`)
    if (res && res.gasPrice) {
      return Big(res.gasPrice).mul(GWEI)
    }

    return null
  }

  private estimateGasPriceFromPreviousBlocks () {
    return new Promise((resolve, reject) => {
      this.emitPayload({ method: 'eth_blockNumber'}, (err: any, res: any) => {
        let lastBlock = Big(res.result)
        const blockNums = []

        for (let i = 0; i < 10; i++) {
          blockNums.push(`0x${lastBlock.toString()}`)
          lastBlock = lastBlock.sub(1)
        }

        const gets = blockNums.map((item: string) => this.getBlock(item))

        Promise.all(gets)
          .then((blocks: Transaction[][]) => {
            resolve(minBN(this.meanGasPrice(blocks), MAX_PRICE))
          })
          .catch(reject)
      })
    })
  }

  private getBlock (item: string): Promise<Transaction[]> {
    return new Promise((resolve, reject) => this.emitPayload({ method: 'eth_getBlockByNumber', params: [ item, true ] }, (err: any, res: any) => {
      if (err) {
        return reject(err)
      }

      if (!res.result) {
        return resolve([])
      }

      resolve(res.result.transactions)
    }))
  }

  private meanGasPrice(blocks: Transaction[][]) {
    let sum = Big(0)
    let count = 0

    for (let i = 0; i < blocks.length; i++) {
      const txns = blocks[i]

      for (let j = 0; j < txns.length; j++) {
        const currPrice = Big(txns[j].gasPrice)
        sum = sum.add(currPrice)
        count++
      }
    }

    return sum.div(count)
  }
}
