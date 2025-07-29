# QA & Testing Guide

## Running Tests
- Unit tests: `npm test`
- E2E tests: `npx cypress open` or `npx cypress run`

## Coverage
- Run `npm run coverage` to generate a coverage report.
- Aim for at least 80% coverage on business logic and hooks.

## Best Practices
- Write tests for all new features and bug fixes.
- Use descriptive test names and group related tests.
- Add E2E tests for critical flows (project/task creation, Kanban, dashboard).

## Troubleshooting
- If tests fail, check for missing dependencies or incorrect imports.
- Ensure your dev server is running for E2E tests.
