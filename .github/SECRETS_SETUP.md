# GitHub Secrets Setup for CI/CD

This document describes all the GitHub secrets required for the CI/CD pipeline to function properly.

## Required Secrets

### 1. Netlify Configuration

#### `NETLIFY_AUTH_TOKEN` (Required)
- **Purpose**: Authenticates the CI/CD pipeline with Netlify
- **How to obtain**:
  1. Log in to Netlify
  2. Go to User Settings → Applications
  3. Under "Personal access tokens", click "New access token"
  4. Give it a descriptive name (e.g., "GitHub Actions CI/CD")
  5. Copy the token immediately (it won't be shown again)

#### `NETLIFY_PROD_SITE_ID` (Required)
- **Purpose**: Identifies which Netlify site to deploy to
- **How to obtain**:
  1. Log in to Netlify
  2. Navigate to your site
  3. Go to Site settings → General
  4. Copy the "Site ID" (looks like: `12345678-1234-1234-1234-123456789012`)

### 2. Production Environment Variables

#### `PROD_API_URL` (Optional)
- **Purpose**: Backend API URL for production
- **Default**: `https://api.wildeditor.luminari.com`
- **Example**: `https://api.wildeditor.luminari.com`

#### `PROD_SUPABASE_URL` (Optional)
- **Purpose**: Supabase project URL for production
- **How to obtain**: From your Supabase project dashboard
- **Example**: `https://your-project.supabase.co`

#### `PROD_SUPABASE_ANON_KEY` (Optional)
- **Purpose**: Supabase anonymous key for production
- **How to obtain**: From your Supabase project dashboard → Settings → API
- **Note**: This is a public key, safe to expose in frontend code

### 3. Development/Preview Environment Variables

#### `VITE_API_URL` (Optional)
- **Purpose**: Backend API URL for preview deployments
- **Default**: `http://localhost:8000/api`
- **Example**: `https://staging-api.wildeditor.luminari.com`

#### `VITE_SUPABASE_URL` (Optional)
- **Purpose**: Supabase project URL for development/preview
- **Example**: `https://your-dev-project.supabase.co`

#### `VITE_SUPABASE_ANON_KEY` (Optional)
- **Purpose**: Supabase anonymous key for development/preview
- **Note**: Can be the same as production if using the same Supabase project

### 4. Notification Secrets (Optional)

#### `SLACK_WEBHOOK_URL` (Optional)
- **Purpose**: Send deployment notifications to Slack
- **How to obtain**:
  1. Go to your Slack workspace
  2. Add the "Incoming Webhooks" app
  3. Choose a channel
  4. Copy the webhook URL
- **Example**: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX`

## How to Add Secrets to GitHub

1. Navigate to your repository on GitHub
2. Go to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Enter the secret name (exactly as listed above)
5. Enter the secret value
6. Click "Add secret"

## Minimal Setup

For a minimal working setup, you only need:
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_PROD_SITE_ID`

All other secrets have sensible defaults or are optional.

## Security Notes

- Never commit secrets to the repository
- Rotate secrets periodically
- Use different values for production and development when possible
- The `VITE_` prefixed variables are exposed to the frontend, so they should not contain sensitive data
- Supabase anon keys are designed to be public and are safe to expose

## Troubleshooting

### "Netlify site not found"
- Verify `NETLIFY_PROD_SITE_ID` is correct
- Ensure the Netlify site exists and is linked to your account

### "Authentication failed"
- Regenerate `NETLIFY_AUTH_TOKEN` and update the secret
- Ensure the token has not expired

### "Environment variables undefined in build"
- Check that secret names match exactly (case-sensitive)
- For Vite variables, ensure they start with `VITE_`
- Verify secrets are added to the correct environment (repository, not organization)