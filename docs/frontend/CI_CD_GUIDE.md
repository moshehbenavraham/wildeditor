# MonoRepo

## The frontend CI/CD workflow:

  1. Triggers: Runs on pushes to main/develop branches and pull requests
  2. Build & Test:
    - Installs dependencies
    - Runs linting and type checking
    - Runs tests and security audits
    - Builds the frontend app
  3. PR Previews: Deploys preview to Netlify for pull requests
  4. Production Deploy: When pushed to main branch:
    - Builds with production environment variables
    - Deploys to Netlify production site (wildeditor.luminari.com)
    - Uses Netlify CLI for deployment
  5. Notifications: Sends Slack notifications on deployment success/failure

  The frontend is deployed to Netlify automatically on main branch commits.

## Files Involved in CI/CD Process

- `.github/workflows/ci.yml` - Main CI/CD pipeline configuration
- `apps/frontend/netlify.toml` - Netlify deployment configuration
- `apps/frontend/package.json` - Build scripts and dependencies
- `apps/frontend/dist/` - Build output directory (generated)
- `package.json` - Root monorepo scripts for linting, type-checking, and building
- `package-lock.json` - Dependency lock file used for caching
- `audit-ci.json` - Security audit configuration (referenced in CI)

## Frontend Tech Stack

- React 18.3.1
- TypeScript 5.5.3
- Vite 7.0.6
- Tailwind CSS 3.4.1
- Lucide React 0.344.0
- Supabase JS 2.53.0
- ESLint 9.9.1
- PostCSS 8.4.35
- Autoprefixer 10.4.18

## Supabase CI/CD Integration

Environment variables are baked into the JavaScript bundle at build time:

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Source: GitHub Environment Secrets (production) or Repository Secrets (other builds)
- Build process: Vite replaces `import.meta.env.VITE_*` with actual values
- Result: Values hardcoded in compiled JS, not loaded at runtime
- Security: Anon key is designed for public client-side use with RLS