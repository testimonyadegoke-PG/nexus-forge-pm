# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/b6f2f6b7-b932-4136-8a6c-d9f1eca14900

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b6f2f6b7-b932-4136-8a6c-d9f1eca14900) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b6f2f6b7-b932-4136-8a6c-d9f1eca14900) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

---

## DevOps, CI/CD, and Staging Recommendations

### Continuous Integration & Deployment (CI/CD)
- Use GitHub Actions, GitLab CI, or your preferred CI system to:
  - Run all unit and E2E tests on every PR and push (`npm test`, `npx cypress run`)
  - Run lint checks and enforce code style (`npm run lint`)
  - Build the app (`npm run build`) and fail on errors
- Recommended: Deploy to a staging environment before production
- Example: [GitHub Actions for Vite/React](https://github.com/marketplace/actions/deploy-to-github-pages)

### Staging Environments
- Maintain a separate staging branch/environment for QA
- Deploy all PRs to temporary preview environments for review
- Use environment variables to separate dev, staging, and prod configs

### Best Practices
- Use Dependabot or similar to keep dependencies updated
- Enable branch protection and require PR reviews
- Use code coverage tools (e.g., Codecov, Coveralls)
- Monitor deployments and roll back on failure

### Security
- Run `npm audit` regularly
- Rotate secrets and API keys
- Enforce RBAC and least-privilege in Supabase

---
