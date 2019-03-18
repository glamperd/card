
////////////////////////////////////////
// Define exportable helper functions

const closeIntroModal = () => {
  cy.visit(Cypress.env('publicUrl'))
  // Click through intro modal
  cy.get('button').contains(/next/i).click()
  cy.get('button').contains(/next/i).click()
  cy.get('button').contains(/next/i).click()
  // Make sure $?.?? placeholders are replaced with real values
  cy.get('p').contains('??').should('not.exist')
  cy.get('button').contains(/next/i).click()
  cy.get('p').contains('??').should('not.exist')
  cy.get('button').contains(/got it/i).click()
  // wait until the startup modal closes
  cy.get('span').contains('Starting').should('not.exist')
}

const restoreMnemonic = () => { }

////////////////////////////////////////
// Run tests

describe('Common', () => {
  it('Should display an intro modal that can be closed', () => {
    closeIntroModal()
  })
})

////////////////////////////////////////
// Export helpers to be used in other tests

module.exports = {
  closeIntroModal
}
