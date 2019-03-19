
// In general, we shouldn't ever need to do: cy.get('element').contains('text')
// A more robust way of doing the same thing: cy.contains('element', 'text')
// See: https://github.com/cypress-io/cypress/issues/3747#issuecomment-474292167

////////////////////////////////////////
// Define exportable helper functions

const mnemonicRegex = /([A-Za-z]{3,}\s?){12}/
const addressRegex = /.*0x[0-9a-z]{40}.*/i

const closeIntroModal = () => {
  cy.visit(Cypress.env('publicUrl'))
  // Click through intro modal
  cy.contains('button', /^next$/i).click()
  cy.contains('button', /^next$/i).click()
  cy.contains('button', mnemonicRegex).should('exist')
  cy.contains('button', /^next$/i).click()
  // Make sure $?.?? placeholders have been replaced with real values
  cy.contains('p', '??').should('not.exist')
  cy.contains('button', /^next$/i).click()
  cy.contains('p', '??').should('not.exist')
  cy.contains('button', /^got it!$/i).click()
  // wait until the startup modal closes
  cy.contains('span', /starting/i).should('not.exist')
}

const getAddress = () => {
  return new Cypress.Promise((resolve, reject) => {
    cy.visit(`${Cypress.env('publicUrl')}/deposit`)
    cy.contains('button', /0x/i).invoke('text').then(address => {
      cy.log(`address=${address}`)
      resolve(address)
    })
  })
}

const getMnemonic = () => {
  return new Cypress.Promise((resolve, reject) => {
    cy.visit(`${Cypress.env('publicUrl')}/settings`)
    cy.contains('button', mnemonicRegex).should('not.exist')
    cy.contains('button', /backup phrase/i).click()
    cy.contains('button', mnemonicRegex).should('exist')
    cy.contains('button', mnemonicRegex).invoke('text').then(mnemonic => {
      cy.log(`mnemonic=${mnemonic}`)
      resolve(mnemonic)
    })
  })
}

const burnCard = () => {
  cy.visit(`${Cypress.env('publicUrl')}/settings`)
  cy.contains('button', /burn card/i).click()
  cy.contains('button', /burn$/i).click()
  cy.contains('p', /burning/i).should('not.exist')
  closeIntroModal()
}

const restoreMnemonic = (mnemonic) => {
  cy.visit(`${Cypress.env('publicUrl')}/settings`)
  cy.contains('button', /import/i).click()
  cy.get('input[type="text"]').type(mnemonic)
  cy.get('button').find('svg').click()
}

////////////////////////////////////////
// Export test function to be run in the index
// To prevent re-running tests from imported modules

const testCommon = () => {
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
          cy.contains('button', /0x/i).invoke('text').should('eql', address)
        })
      })
    })
  })
}

////////////////////////////////////////
// Export helpers to be used in other tests & tests to run in index

module.exports = {
  testCommon,
  closeIntroModal,
  getAddress,
  getMnemonic,
  burnCard,
  restoreMnemonic
}
