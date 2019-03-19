const { closeIntroModal, getAddress } = require('./common.js')
const eth = require('ethers')
const provider = new eth.providers.JsonRpcProvider(Cypress.env('provider'))
const wallet = eth.Wallet.fromMnemonic(Cypress.env('mnemonic')).connect(provider)

////////////////////////////////////////
// Define exportable helper functions

// cypress needs control over the order things run, so normal async/promises don't work right
// Gotta wrap traditional promises in `cy.wrap(promise)` so cypress can handle it properly

const deposit = (value) => {
  getAddress().then(address => {
    cy.log(`Sending 0.03 eth from ${wallet.address} to ${address}`)
    return cy.wrap(wallet.sendTransaction({
      to: address,
      value: eth.utils.parseEther(value)
    })).then(tx => {
      cy.contains('button', /back/i).click()
      cy.log(`Transaction sent, waiting for it to get mined..`)
      return cy.wrap(wallet.provider.waitForTransaction(tx.hash)).then(() => {
        cy.log(`Transaction mined, waiting for the deposit to be accepted..`)
        cy.contains('span', /processing/i).should('exist')
        cy.get('h3').children('span').should('not.contain', '00')
        cy.contains('span', /processing/i).should('not.exist')
      })
    })
  })
}

////////////////////////////////////////
// Export test function to be run in the index
// To prevent re-running tests from imported modules

const testDeposit = () => {
  describe('Deposit', () => {
    it.only('Accepts a deposit to displayed address', () => {
      closeIntroModal()
      deposit('0.03')
    })
  })
}

////////////////////////////////////////
// Export helpers to be used in other tests & tests to run in index

module.exports = {
  testDeposit,
  deposit
}
