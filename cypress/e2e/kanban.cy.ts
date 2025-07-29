describe('Kanban Board', () => {
  it('shows columns', () => {
    cy.visit('/');
    cy.contains('To Do');
    cy.contains('In Progress');
    cy.contains('Done');
  });
});
