import my from './utils'

const depositAmount = '0.05' // ETH
const payAmount = '3.14' // Tokens

describe('Daicard', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('publicUrl'))
    my.closeIntroModal()
  })

  describe('Home', () => {
    it(`Should display the card's balance`, () => {
      my.getBalance()
    })

    it(`Should provide links to other pages`, () => {
      my.goToDeposit() && my.goBack()
      my.goToSettings() && my.goBack()
      my.goToReceive() && my.goBack()
      my.goToSend() && my.goBack()
      my.goToCashout() && my.goBack()
    })
  })

  describe('Settings', () => {
    it(`Should provide an option for switching networks`, () => {
      my.goToSettings()
      cy.contains('div[role="button"]', /localhost/i).click()
      cy.contains('li', /rinkeby/i).click()
      cy.contains('a[href="/settings"]', /rinkeby/i).should('exist')
      cy.contains('div[role="button"]', /rinkeby/i).click()
      cy.contains('li', /localhost/i).click()
      cy.contains('a[href="/settings"]', /localhost/i).should('exist')
    })

    it(`Should display our backup mnemonic`, () => {
      my.getMnemonic()
    })

    it(`Should not decollateralize before burning an uncollateralized card`, () => {
      my.burnCard()
    })

    it(`Should decollateralize & preserve balance while burning`, () => {
      my.getAccount().then(account => {
        my.deposit(account.address, depositAmount).then(deposited => {
          my.burnCard(true)
          my.restoreMnemonic(account.mnemonic)
          my.getBalance.then(balance => {
            expect(balance).to.equal(depositAmount)
          })
        })
      })
    })

    it(`Should restore the same address after importing the provided mnemonic`, () => {
      my.getAccount().then(account => {
        my.burnCard()
        my.restoreMnemonic(account.mnemonic)
        my.goToDeposit()
        cy.contains('button', my.addressRegex).invoke('text').should('eql', account.address)
      })
    })
  })

  describe('Deposit', () => {
    it(`Should display our card's address`, () => {
      my.getAddress()
    })

    it(`Should accept a deposit to displayed address`, () => {
      my.getAddress().then(address => {
        my.deposit(address, depositAmount)
      })
    })
  })

  describe('Request', () => {
    it(`Should generate a request link w recipient & amount in url params`, () => {
      my.getAddress().then(address => {
        my.goToReceive()
        cy.get('input[type="number"]').type(payAmount)
        cy.contains('button', `recipient=${address}`).should('exist')
        cy.contains('button', `amountToken=${payAmount}`).should('exist') // TODO: rm leading 0
      })
    })

    it(`Should properly populate the send page when opening a request link`, () => {
      my.getAccount().then(account => {
        my.goToReceive()
        cy.get('input[type="number"]').type(payAmount)
        cy.contains('button', `amountToken=${payAmount}`).invoke('text').then(requestLink => {
          my.burnCard()
          cy.visit(requestLink)
          cy.get(`input[value="${payAmount}"]`).should('exist')
          cy.get(`input[value="${account.address}"]`).should('exist')
        })
      })
    })
  })

  describe('Send', (done) => {
    it(`Should not generate a payment link if the amount provided is invalid`, () => {
      my.getAccount().then(sender => {
        my.deposit(sender.address, depositAmount).then(tokensDeposited => {
          my.goToSend()
          // No negative numbers
          cy.get('input[type="number"]').clear().type('-1')
          cy.contains('button', /link/i).click()
          cy.contains('p', /above 0/i).should('exist')
          // No zero payments
          cy.get('input[type="number"]').clear().type('0')
          cy.contains('button', /link/i).click()
          cy.contains('p', /above 0/i).should('exist')
          // No payments above card's balance
          cy.get('input[type="number"]').clear().type('1' + tokensDeposited)
          cy.contains('button', /link/i).click()
          cy.contains('p', /insufficient balance/i).should('exist')
        })
      })
    })

    it(`Should send a payment when a link payment is opened in another card`, () => {
      my.getAccount().then(recipient => {
        my.burnCard() // also decollateralizes the channel
        my.getAccount().then(sender => {
          my.deposit(sender.address, depositAmount).then(tokensDeposited => {
            my.linkPay(amount).then(redeemLink => {
              my.restoreMnemonic(recipient.mnemonic)
              cy.visit(redeemLink)
              cy.contains('span', /redeeming/i).should('exist')
              cy.contains('h5', /redeemed successfully/i).should('exist')
              cy.contains('p', amount).should('exist')
              my.goHome()
              cy.wait(3000) // TODO: remove race condition
              my.getBalance().then(balance => {
                expect(balance).to.equal(depositAmount)
              })
            })
          })
        })
      })
    })

    it(`Should not send a payment when input invalid`, () => {
      my.getAccount().then(sender => {
        my.deposit(sender.address, depositAmount).then(tokensDeposited => {
          my.goToSend()
          cy.get('input[type="number"]').should('exist')
          // No negative numbers
          cy.get('input[type="number"]').clear().type('-1')
          cy.contains('button', /send/i).click()
          cy.contains('p', /above 0/i).should('exist')
          // No zero payments
          cy.get('input[type="number"]').clear().type('0')
          cy.contains('button', /send/i).click()
          cy.contains('p', /above 0/i).should('exist')
          // No payments above card's balance
          cy.get('input[type="number"]').clear().type('1' + tokensDeposited)
          cy.contains('button', /send/i).click()
          cy.contains('p', /insufficient balance/i).should('exist')
          // No invalid addresses
          cy.get('input[type="string"]').clear().type('0xabc123')
          cy.contains('button', /send/i).click()
          cy.contains('p', /invalid address/i).should('exist')
        })
      })
    })

    // I don't think this is possible yet w/out the other card being online during payment
    it.skip(`Should send a payment to a card that has already been collateralized`, () => { })
  })

  describe('Withdraw', () => {
    it(`Should not withdraw to an invalid address`, () => {
      my.getAccount().then(account => {
        my.deposit(account.address, depositAmount).then((balance) => {
          my.goToCashout()
          cy.get('input[type="text"]').type('0xabc123')
          cy.contains('button', /cash out eth/i).click()
          cy.contains('p', /invalid address/i).should('exist')
        })
      })
    })

    it(`Should withdraw to a valid address`, () => {
      my.getAccount().then(sender => {
        my.deposit(sender.address, depositAmount).then((balance) => {
          my.cashout()
        })
      })
    })
  })
})
