# Developer Onboarding Guide: Nexus Forge PPM

Welcome to the Nexus Forge PPM codebase! This guide will help you get started as a developer.

## 1. Project Structure
- `src/` — Main frontend code (React, hooks, pages, components)
- `supabase/migrations/` — Database schema and migration files (PostgreSQL)
- `__tests__/` — Unit tests (Jest/React Testing Library)
- `cypress/` — End-to-end tests (Cypress)
- `docs/` — API, data model, and architecture docs

## 2. Setup
- Node.js 18+ and npm required
- Run `npm install` to get dependencies
- Copy `.env.example` to `.env` and fill in Supabase/other secrets
- Start dev server: `npm run dev`

## 3. Useful Scripts
- `npm run dev` — Start local server
- `npm test` — Run unit tests
- `npx cypress open` — Run E2E tests
- `npm run lint` — Run linter

## 4. Coding Standards
- Use TypeScript and React best practices
- Use shadcn-ui and Tailwind for UI
- Write accessible, ARIA-compliant components
- Add tests for new features

## 5. Contributing
- Fork, branch, and open PRs for changes
- Write clear commit messages
- Run all tests before pushing
- Follow code review feedback

## 6. Resources
- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

For questions, contact the project maintainer or check the `/docs` folder for more details.
