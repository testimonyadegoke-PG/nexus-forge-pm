describe('Project Creation Flow', () => {
  it('should allow a user to create a new project', () => {
    cy.visit('/projects');
    cy.contains('Create Project').click();
    cy.get('input[placeholder="Project name"]').type('Test Project');
    cy.get('textarea[placeholder="Enter project description"]').type('This is a test project.');
    cy.get('button').contains('Create').click();
    cy.contains('Test Project').should('exist');
  });
});
