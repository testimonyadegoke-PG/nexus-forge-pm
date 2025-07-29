describe('Dashboard Widgets', () => {
  it('shows widgets', () => {
    cy.visit('/');
    cy.contains('Projects');
  });
});
