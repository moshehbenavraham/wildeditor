# Netlify CLI GitHub Actions Setup

This guide explains how to set up the Netlify CLI deployment using GitHub Actions, which respects your `netlify.toml` configuration.

## Implementation Overview

The GitHub Actions workflow has been updated to use Netlify CLI instead of the `nwtgck/actions-netlify` action. This ensures that your `netlify.toml` settings are properly respected during the build and deployment process.

## Changes Made

### 1. Updated GitHub Actions Workflow

Modified `.github/workflows/ci.yml` to:
- Install Netlify CLI globally before deployment
- Use `netlify deploy --build --prod` command which respects `netlify.toml`
- Remove the separate build step (Netlify CLI handles it)
- Pass environment variables directly to the Netlify CLI command
- Removed staging deployment (production only)

### Key Benefits

- **Respects netlify.toml**: All build settings, redirects, headers, and environment configurations in your `netlify.toml` are now properly applied
- **Simplified workflow**: No need for separate build steps - Netlify CLI handles everything
- **Consistent behavior**: Deployments from GitHub Actions now behave identically to manual Netlify deployments

## Required GitHub Secrets

You need to set up the following secrets in your GitHub repository:

1. **NETLIFY_AUTH_TOKEN** (Required)
   - Get this from Netlify: User Settings → Applications → Personal Access Tokens
   - Create a new token with appropriate permissions
   - Add to GitHub: Settings → Secrets and variables → Actions → New repository secret

2. **NETLIFY_PROD_SITE_ID** (Required)
   - Find in Netlify: Site Settings → General → Site details → Site ID
   - Add to GitHub secrets

3. **Environment-specific secrets** (Optional but recommended):
   - PROD_API_URL
   - PROD_SUPABASE_URL
   - PROD_SUPABASE_ANON_KEY

## How It Works

**Production Deployment** (on main branch):
```yaml
- name: Install Netlify CLI
  run: npm install -g netlify-cli
  
- name: Deploy to Netlify (Production)
  run: |
    netlify deploy --build --prod --message "Deploy from GitHub Actions (production)"
  env:
    NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
    NETLIFY_SITE_ID: ${{ secrets.NETLIFY_PROD_SITE_ID }}
    # Environment variables are passed here
```

## Verification

After setting up the secrets and pushing to your repository:

1. Check GitHub Actions tab for workflow runs
2. Verify that the Netlify CLI is properly installed
3. Confirm that deployments respect your `netlify.toml` settings
4. Check that environment variables are properly passed to the build

## Troubleshooting

If deployments fail:

1. **Check Netlify CLI installation**: Ensure the CLI installs successfully
2. **Verify secrets**: Double-check that all required secrets are set in GitHub
3. **Review netlify.toml**: Ensure your configuration is valid
4. **Check logs**: Review GitHub Actions logs for specific error messages

## Next Steps

1. Set up the required GitHub secrets
2. Test deployment by pushing to develop branch
3. Verify staging deployment works correctly
4. Test production deployment by merging to main branch