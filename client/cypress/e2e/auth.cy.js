describe('Auth Flow', () => {
  it('should register and login', () => {
    cy.visit('/register');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('form').submit();

    cy.url().should('include', '/dashboard');
  });
});
