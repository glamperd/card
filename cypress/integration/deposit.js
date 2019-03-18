const { closeIntroModal, getAddress } = require('./common.js')
const eth = require('ethers')
const provider = new eth.providers.JsonRpcProvider(Cypress.env('provider'))
const wallet = eth.Wallet.fromMnemonic(Cypress.env('mnemonic')).connect(provider)

////////////////////////////////////////
// Define exportable helper functions

const deposit = (value) => {
  getAddress().then(address => {
    cy.log(`Sending 0.03 eth from ${wallet.address} to ${address}`)
    return wallet.sendTransaction({
      to: address,
      value: eth.utils.parseEther(value)
    }).then(tx => {
      cy.get('button').contains("Back").click()
      cy.log(`Transaction sent, waiting for it to get mined..`)
      return wallet.provider.waitForTransaction(tx.hash).then(() => {
        cy.log(`Transaction mined, waiting for the deposit to be accepted..`)
        cy.get('span').contains('Processing').should('exist')
        cy.get('h3').children('span').contains('00').should('not.exist')
        cy.get('span').contains('Processing').should('not.exist')
      })
    })
  })
}

////////////////////////////////////////
// Run tests

describe('Deposit', () => {
  it('Accepts a deposit to displayed address', () => {
    closeIntroModal()
    deposit('0.03')
  })
})

////////////////////////////////////////
// Export helpers to be used in other tests

module.exports = {
  deposit
}
