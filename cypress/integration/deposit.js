const eth = require('ethers')
const provider = new eth.providers.JsonRpcProvider(Cypress.env('provider'))
const wallet = eth.Wallet.fromMnemonic(Cypress.env('mnemonic')).connect(provider)

describe('Deposit', () => {
  beforeEach(() => {
    // close intro modal
    cy.visit(Cypress.env('publicUrl'))
    cy.get('button').contains(/next/i).click()
    cy.get('button').contains(/next/i).click()
    cy.get('button').contains(/next/i).click()
    cy.get('button').contains(/next/i).click()
    cy.get('button').contains(/got it/i).click()
    // wait until the startup modal closes
    cy.get('span#message-id').should('not.exist')
    // click link to deposit page
    cy.get('a[href="/deposit"]').click()
  })

  it('Displays a valid deposit address', () => {
    cy.get('button').contains(/0[Xx]/).invoke('text').should('match', /0[xX][0-9a-zA-Z]{40}/)
  })

  it('Accepts a deposit to displayed address', () => {
    cy.get('button').contains(/0[Xx]/).invoke('text').then(address => {
      cy.log(`Sending 0.03 eth from ${wallet.address} to ${address}`)
      return wallet.sendTransaction({
        to: address,
        value: eth.utils.parseEther('0.03')
      }).then(tx => {
        cy.get('button').contains("Back").click()
        cy.log(`Transaction sent, waiting for it to get mined..`)
        return wallet.provider.waitForTransaction(tx.hash).then(() => {
          cy.log(`Transaction mined, waiting for the deposit to be accepted..`)
          cy.get('h3').children('span').contains('00').should('not.exist')
        })
      })
    })
  })
})
