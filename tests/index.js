import my from './utils'

describe('Daicard', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('publicUrl'))
    my.closeIntroModal()
  })

  describe('Home', () => {
    it(`Should display the card's balance`, () => {})
    it(`Should provide links to other pages`, () => {})
  })

  describe('Settings', () => {
    it(`Should provide an option for switching networks`, () => { })

    it(`Should display our backup mnemonic`, () => {
      my.getMnemonic()
    })

    it(`Should restore the same address after importing the provided mnemonic`, () => {
      my.getAccount().then(account => {
        my.burnCard()
        my.restoreMnemonic(mnemonic)
        cy.get('a[href="/deposit"]').click()
        cy.contains('button', my.addressRegex).invoke('text').should('eql', account.address)
      })
    })

    it(`Should decollateralize before burning`, () => { })
  })

  describe('Deposit', () => {
    it(`Should display our card's address`, () => {
      my.getAddress()
    })

    it(`Should accept a deposit to displayed address`, () => {
      my.getAddress().then(address => {
        my.deposit(address, '0.03')
      })
    })
  })

  describe('Request', () => {
    it(`Should generate a request link w requested amount in a url param`, () => { })
    it(`Should properly populate the send page when opening a request link`, () => { })
  })

  describe('Send', (done) => {
    it(`Should not generate a payment link if the amount provided is invalid`, () => {})

    it(`Should send a payment when a link payment is opened in another card`, () => {})

    it(`Should not send a payment when the amount provided is invalid`, () => {})

    it(`Should not send a payment when the address provided is invalid`, () => {})

    // I don't think this is possible yet w/out the other card being online during payment
    it.skip(`Should send a payment to a card that has already been collateralized`, () => {
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

  describe('Withdraw', () => {
    it(`Should not withdraw to an invalid address`, () => {})
    it(`Should withdraw to a valid address`, () => {})
  })

})


