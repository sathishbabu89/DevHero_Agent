describe('Login Page Accessibility', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.injectAxe();
  });

  it('should have no accessibility violations', () => {
    cy.checkA11y();
  });

  it('should be navigable by keyboard', () => {
    cy.get('body').tab();
    cy.focused().should('have.attr', 'name', 'email');
    
    cy.focused().type('test@example.com').tab();
    cy.focused().should('have.attr', 'name', 'password');
    
    cy.focused().type('password123').tab();
    cy.focused().should('have.attr', 'type', 'submit');
    
    cy.focused().type('{enter}');
  });

  it('has proper ARIA labels and roles', () => {
    cy.get('input[name="email"]').should('have.attr', 'aria-required', 'true');
    cy.get('input[name="password"]').should('have.attr', 'aria-required', 'true');
    cy.get('form').should('have.attr', 'aria-label', 'Login form');
  });
});