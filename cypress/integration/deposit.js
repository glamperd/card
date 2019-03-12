const eth = require('ethers')
const provider = new eth.providers.JsonRpcProvider(Cypress.env('provider'))
const wallet = eth.Wallet.fromMnemonic(Cypress.env('mnemonic')).connect(provider)
const publicUrl = Cypress.env('publicUrl')

describe('Deposit', () => {
  it('Displays loading message while connext gets started', () => {
    cy.visit(publicUrl)
    cy.get('span#message-id').should('not.exist')
  })

  it('Displays a valid deposit address', () => {
    cy.visit(publicUrl)
    cy.get('span#message-id').should('not.exist')
    cy.get('a[href="/deposit"]').click()
    cy.get('button').contains(/0[Xx]/).invoke('text').should('match', /0[xX][0-9a-zA-Z]{40}/)
  })

  it('Accepts a deposit to displayed address', () => {
    cy.visit(publicUrl)
    cy.get('span#message-id').should('not.exist')
    cy.get('a[href="/deposit"]').click()
    cy.get('button').contains(/0[Xx]/).invoke('text').then(address => {
      cy.get('button').contains("Back").click()
      wallet.sendTransaction({
        to: address,
        value: eth.utils.parseEther('0.03')
      }).then(() => {
        wallet.provider.waitForTransaction(tx.hash).then(() => {
          cy.get('h3').children('span').contains('00').should('not.exist')
        })
      })
    })

  })
})
