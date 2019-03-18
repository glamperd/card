const { closeIntroModal, getAddress, getMnemonic, burnCard, restoreMnemonic } = require('./common.js')
const { deposit } = require('./deposit.js')
const eth = require('ethers')
const provider = new eth.providers.JsonRpcProvider(Cypress.env('provider'))
const wallet = eth.Wallet.fromMnemonic(Cypress.env('mnemonic')).connect(provider)

////////////////////////////////////////
// Define exportable helper functions

const pay = (to, value) => {
  cy.visit(`${Cypress.env('publicUrl')}/send`)
  cy.get('input[type="string"]').type(to)
  cy.get('input[type="number"]').type(value)
  cy.get('button').contains(/send/i).click()
  cy.get('h5').contains(/in progress/i).should('exist')
  cy.get('div').contains(/payment success/i).should('exist')
  cy.get('button').contains(/home/i).click()
}

describe('Payments', (done) => {
  it('Can send a payment to a card that has not been collateralized', () => {
    // Does this even work?
  })

  it('Can send a payment to a card that has already been collateralized', () => {
    closeIntroModal()
    deposit('0.05').then(() => {
      cy.log('deposit successful')
      getMnemonic().then(senderMnemonic => {
        burnCard()
        getAddress().then(recipientAddress => {
          getMnemonic().then(recipientMnemonic => {
            deposit('0.02').then(() => {
              cy.get('h3').children('span').invoke('text').then(prevBalance => {
                restoreMnemonic(senderMnemonic)
                pay(recipientAddress, '0.01')
                restoreMnemonic(recipientMnemonic)
                const expected = String(Number(prevBalance + 1))
                cy.get('h3').children('span').contains(expected).should('exist')
                done()
              })
            })
          })
        })
      })
    })
    // Get our current mnemonic
    // Burn card & get the new card's address & mnemonic
    // Restore old card
    // Send payment to new card's address
    // Restore new card
    // Make sure payment was delivered
  })
})

