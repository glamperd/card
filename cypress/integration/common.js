
////////////////////////////////////////
// Define exportable helper functions

const closeIntroModal = () => {
  cy.visit(Cypress.env('publicUrl'))
  // Click through intro modal
  cy.get('button').contains(/^next$/i).click()
  cy.get('button').contains(/^next$/i).click()
  cy.get('button').contains(/^next$/i).click()
  // Make sure $?.?? placeholders are replaced with real values
  cy.get('p').should('not.contain', '??')
  cy.get('button').contains(/^next$/i).click()
  cy.get('p').should('not.contain', '??')
  cy.get('button').contains(/^got it!$/i).click()
  // wait until the startup modal closes
  cy.get('span').should('not.contain', 'Starting')
}

const getAddress = () => {
  return new Cypress.Promise((resolve, reject) => {
    cy.visit(`${Cypress.env('publicUrl')}/deposit`)
    cy.get('button').contains(/0x/i).invoke('text').then(address => {
      cy.log(`address=${address}`)
      resolve(address)
    })
  })
}

const getMnemonic = () => {
  return new Cypress.Promise((resolve, reject) => {
    cy.visit(`${Cypress.env('publicUrl')}/settings`)
    cy.get('button').should('not.match', /([a-z]{3,}\s?){12}/i) // TODO: this is probably broken
    cy.get('button').contains(/backup phrase/i).click()
    //cy.get('button').should('match', /([a-z]{4,}\s?){12}/i) // TODO: why is this broken?
    cy.get('button').contains(/([a-z]{3,}\s?){12}/i).invoke('text').then(mnemonic => {
      cy.log(`mnemonic=${mnemonic}`)
      resolve(mnemonic)
    })
  })
}

const burnCard = () => {
  cy.visit(`${Cypress.env('publicUrl')}/settings`)
  cy.get('button').contains(/burn card/i).click()
  cy.get('button').contains(/burn$/i).click()
  cy.get('p').should('not.match', /burning/i) // TODO: also probably broken
  closeIntroModal()
}

const restoreMnemonic = (mnemonic) => {
  cy.visit(`${Cypress.env('publicUrl')}/settings`)
  cy.get('button').contains(/import/i).click()
  cy.get('input[type="text"]').type(mnemonic)
  cy.get('button').find('svg').click()
}

////////////////////////////////////////
// Run tests

describe('Common', () => {
  it('Should display an intro modal that can be closed', () => {
    closeIntroModal()
  })

  it('Should display our address on the deposit page', () => {
    closeIntroModal()
    getAddress()
  })

  it('Should display our backup mnemonic in the settings', () => {
    closeIntroModal()
    getMnemonic()
  })

  it('Should restore the same card from mnemonic after burning', () => {
    closeIntroModal()
    getAddress().then(address => {
      getMnemonic().then(mnemonic => {
        burnCard()
        restoreMnemonic(mnemonic)
        cy.get('a[href="/deposit"]').click()
        cy.get('button').contains(/0x/i).invoke('text').should('eql', address)
      })
    })
  })
})

////////////////////////////////////////
// Export helpers to be used in other tests

module.exports = {
  closeIntroModal,
  getAddress,
  getMnemonic,
  burnCard,
  restoreMnemonic
}
