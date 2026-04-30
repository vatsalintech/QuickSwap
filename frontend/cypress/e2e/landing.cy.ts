describe('Landing Page', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('should load the landing page and show the logo', () => {
    cy.get('.logo-text').should('contain', 'Quickswap');
  });

  it('should have a "Start selling" button', () => {
    cy.contains('button', 'Start selling').should('be.visible');
  });

  it('should navigate to sign in page when clicking "Sign in"', () => {
    // Force unauthenticated state so navbar renders Sign in consistently.
    cy.contains('button', 'Sign in').should('be.visible').click();
    cy.url().should('include', '/signin');
  });
});
