import my from './utils'

describe('Daicard', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('publicUrl'))
    my.closeIntroModal()
  })

  describe('Common', () => {
    it('Should display our address on the deposit page', () => {
      my.getAddress()
    })

    it('Should display our backup mnemonic in the settings', () => {
      my.getMnemonic()
    })

    it('Should restore the same card from mnemonic after burning', () => {
      my.getAccount().then(account => {
        my.burnCard()
        my.restoreMnemonic(mnemonic)
        cy.get('a[href="/deposit"]').click()
        cy.contains('button', my.addressRegex).invoke('text').should('eql', account.address)
      })
    })
  })

  describe('Deposit', () => {
    it('Accepts a deposit to displayed address', () => {
      my.getAddress().then(address => {
        my.deposit(address, '0.03')
      })
    })
  })

  describe('Payments', (done) => {
    // I don't think this is possible yet w/out the other card being online during payment
    it.skip('Can send a payment to a card that has already been collateralized', () => {
      my.getAccount().then(sender => {
        my.deposit(sender.address, '0.05').then(() => {
          my.burnCard() // also decollateralizes the channel
          my.getAccount().then(recipient => {
            my.deposit(recipient.address, '0.02').then(() => {
              cy.get('h3').children('span').invoke('text').then(prevBalance => {
                my.restoreMnemonic(sender.mnemonic)
                my.pay(recipient.address, '0.01')
                my.restoreMnemonic(recipient.mnemonic)
                const expected = String(Number(prevBalance + 1))
                cy.get('h3').children('span').contains(expected).should('exist')
              })
            })
          })
        })
      })
    })

  })
})


