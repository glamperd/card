const eth = require('ethers')
const provider = new eth.providers.JsonRpcProvider(Cypress.env('provider'))
const wallet = eth.Wallet.fromMnemonic(Cypress.env('mnemonic')).connect(provider)

const mnemonicRegex = /([A-Za-z]{3,}\s?){12}/
const addressRegex = /.*0x[0-9a-z]{40}.*/i
const my = {}

////////////////////////////////////////
// Vanilla cypress compilations

my.closeIntroModal = () => {
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

my.burnCard = () => {
  cy.visit(`${Cypress.env('publicUrl')}/settings`)
  cy.contains('button', /burn card/i).click()
  cy.contains('button', /burn$/i).click()
  cy.contains('p', /burning/i).should('not.exist')
  my.closeIntroModal()
}

my.restoreMnemonic = (mnemonic) => {
  cy.visit(`${Cypress.env('publicUrl')}/settings`)
  cy.contains('button', /import/i).click()
  cy.get('input[type="text"]').type(mnemonic)
  cy.get('button').find('svg').click()
}

my.pay = (to, value) => {
  cy.visit(`${Cypress.env('publicUrl')}/send`)
  cy.get('input[type="string"]').type(to)
  cy.get('input[type="number"]').type(value)
  cy.get('button').contains(/send/i).click()
  cy.get('h5').contains(/in progress/i).should('exist')
  cy.get('div').contains(/payment success/i).should('exist')
  cy.get('button').contains(/home/i).click()
}

////////////////////////////////////////
// Data handling functions

// Cypress needs control over the order things run in, so normal async/promises don't work right
// Gotta return data in a Cypress.Promise & make sure you return promises
// Gotta wrap traditional promises in `cy.wrap(promise)` so cypress can handle it properly


my.getAddress = () => {
  return cy.wrap(new Cypress.Promise((resolve, reject) => {
    cy.visit(`${Cypress.env('publicUrl')}/deposit`)
    cy.contains('button', /0x/i).invoke('text').then(address => {
      cy.log(`address=${address}`)
      resolve(address)
    })
  }))
}

my.getMnemonic = () => {
  return cy.wrap(new Cypress.Promise((resolve, reject) => {
    cy.visit(`${Cypress.env('publicUrl')}/settings`)
    cy.contains('button', mnemonicRegex).should('not.exist')
    cy.contains('button', /backup phrase/i).click()
    cy.contains('button', mnemonicRegex).should('exist')
    cy.contains('button', mnemonicRegex).invoke('text').then(mnemonic => {
      cy.log(`mnemonic=${mnemonic}`)
      resolve(mnemonic)
    })
  }))
}

my.deposit = (to, value) => {
  return wallet.sendTransaction({
    to: address,
    value: eth.utils.parseEther(value)
  }).then(tx => {
    cy.contains('button', /back/i).click()
    cy.log(`Transaction sent, waiting for it to get mined..`)
    return wallet.provider.waitForTransaction(tx.hash).then(() => {
      cy.log(`Transaction mined, waiting for the deposit to be accepted..`)
      cy.contains('span', /processing/i).should('exist')
      cy.get('h3').children('span').should('not.contain', '00')
      cy.contains('span', /processing/i).should('not.exist')
    })
  })
}

export default my
