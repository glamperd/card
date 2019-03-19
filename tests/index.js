import my from './utils'

describe('Daicard', () => {
  beforeEach(() => {
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
      my.getAddress().then(address => {
        my.getMnemonic().then(mnemonic => {
          my.burnCard()
          my.restoreMnemonic(mnemonic)
          cy.get('a[href="/deposit"]').click()
          cy.contains('button', /0x/i).invoke('text').should('eql', address)
        })
      })
    })
  })

  describe('Deposit', () => {
    it('Accepts a deposit to displayed address', () => {
      my.getAddress().then(address => {
        cy.log(`Sending 0.03 eth from ${wallet.address} to ${address}`)
        my.deposit(address, '0.03')
      })
    })
  })


  // TODO: don't skip these
  describe('Payments', (done) => {
    it.skip('Can send a payment to a card that has not been collateralized', () => {
      // Does this even work?
    })
    it.skip('Can send a payment to a card that has already been collateralized', () => {
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
    })
  })

})


