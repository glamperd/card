const eth = require('ethers')
const provider = new eth.providers.JsonRpcProvider(Cypress.env('provider'))
const wallet = eth.Wallet.fromMnemonic(Cypress.env('mnemonic')).connect(provider)

describe('Deposit', () => {
  it('Displays loading message while connext gets started', () => {
    cy.visit('http://localhost/deposit')
    // Wait for connext controllers to all start up
    cy.get('span#message-id').should('not.exist')
  })

  it('Displays a valid deposit address', () => {
    cy.visit('http://localhost')
    cy.get('span#message-id').should('not.exist')
    cy.get('a[href="/deposit"]').click()
    // NOTE: Copy/paste in cypress doesn't work yet but will be added soon:
    // https://github.com/cypress-io/cypress/issues/311
    cy.get('button').contains(/0[Xx]/).invoke('text').should('match', /0[xX][0-9a-zA-Z]{40}/)
  })

  it.only('Accepts a deposit to displayed address', () => {
    cy.visit('http://localhost')
    cy.get('span#message-id').should('not.exist')
    cy.get('a[href="/deposit"]').click()
    cy.get('button').contains(/0[Xx]/).invoke('text').then(async (address) => {

      cy.get('button').contains("Back").click()
      console.log(`Sending funds to: ${address}`)
      const tx = await wallet.sendTransaction({ to: address, value: eth.utils.parseEther('0.03') })
      console.log(`Waiting for tx to get mined: ${tx.hash}`)
      await wallet.provider.waitForTransaction(tx.hash)
      console.log(`Mined!`)
      cy.get('h3').children('span').contains('00').should('not.exist')

    })
  })
})
