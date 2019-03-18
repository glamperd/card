const { closeIntroModal } = require('./common.js')
const eth = require('ethers')

const provider = new eth.providers.JsonRpcProvider(Cypress.env('provider'))
const wallet = eth.Wallet.fromMnemonic(Cypress.env('mnemonic')).connect(provider)

////////////////////////////////////////
// Define exportable helper functions

const deposit = (value) => {
  cy.get('a[href="/deposit"]').click()
  cy.get('button').contains(/0[Xx]/).invoke('text').then(address => {
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
  beforeEach(() => {
    cy.visit(Cypress.env('publicUrl'))
    closeIntroModal()
  })

  it('Displays a valid deposit address', () => {
    cy.get('a[href="/deposit"]').click()
    cy.get('button').contains(/0[Xx]/).invoke('text').should('match', /0[xX][0-9a-zA-Z]{40}/)
    // TODO: test for copy snackbar once cypress fixes: github.com/cypress-io/cypress/issues/2739
    //cy.get('button').contains(/0[Xx]/).click();cy.get('span').contains('Copied').should('exist')
  })

  it('Accepts a deposit to displayed address', () => {
    deposit('0.03')
  })
})

////////////////////////////////////////
// Export helpers to be used in other tests

module.exports = {
  deposit
}
