
////////////////////////////////////////
// Define exportable helper functions

const closeIntroModal = () => {
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

////////////////////////////////////////
// Run tests

describe('Common', () => {
  it('Should display an intro modal that can be closed', () => {
    cy.visit(Cypress.env('publicUrl'))
    closeIntroModal()
  })

  it('Should display our backup mnemonic', () => {
    cy.visit(Cypress.env('publicUrl'))
    closeIntroModal()
    cy.get('a[href="/settings"]').click()
    cy.get('button').contains(/([a-zA-Z]{3,}\s?){12}/).should('not.exist')
    cy.get('button').contains(/backup phrase/i).click()
    cy.get('button').contains(/([a-zA-Z]{3,}\s?){12}/).should('exist')
  })

  it.only('Should restore the same card from mnemonic after burning', () => {
    cy.visit(Cypress.env('publicUrl'))
    closeIntroModal()
    cy.get('a[href="/deposit"]').click()
    cy.get('button').contains(/0[Xx]/).invoke('text').then(address => {
      cy.log(`address=${address}`)
      cy.get('a[href="/settings"]').click()
      cy.get('button').contains(/([a-zA-Z]{3,}\s?){12}/).should('not.exist')
      cy.get('button').contains(/backup phrase/i).click()
      cy.get('button').contains(/([a-zA-Z]{3,}\s?){12}/).invoke('text').then(mnemonic => {
        cy.log(`mnemonic=${mnemonic}`)
        cy.get('button').contains(/burn card/i).click()
        cy.get('button').contains(/burn$/i).click()
        cy.get('p').contains(/burning/i).should('not.exist')
        cy.reload()
        closeIntroModal()
        cy.get('a[href="/settings"]').click()
        cy.get('button').contains(/import/i).click()
        cy.get('input[type="text"]').type(mnemonic)
        cy.get('button').find('svg').click()
        cy.get('a[href="/deposit"]').click()
        cy.get('button').contains(/0[Xx]/).invoke('text').should('eql', address)
      })
    })
  })
})

////////////////////////////////////////
// Export helpers to be used in other tests

module.exports = {
  closeIntroModal
}
