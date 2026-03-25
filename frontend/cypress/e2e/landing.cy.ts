describe('Landing Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the landing page and show the logo', () => {
    cy.get('.logo-text').should('contain', 'Quickswap');
  });

  it('should have a "Start selling" button', () => {
    cy.get('button').contains('Start selling').should('be.visible');
  });

  it('should navigate to sign in page when clicking "Sign in"', () => {
    // This assumes the user is not logged in initially
    cy.get('button').contains('Sign in').click();
    cy.url().should('include', '/signin');
  });
});
