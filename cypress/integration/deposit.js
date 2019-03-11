describe('Deposit', function() {
  it('Displays the deposit address', function() {
    cy.visit('http://localhost')
    cy.contains('a[href*="deposit"]')
  })
})
