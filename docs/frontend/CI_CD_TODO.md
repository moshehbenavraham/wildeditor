# Frontend CI/CD TODO and Issues

## Troubleshooting Items

### Common Issues and Solutions

#### Netlify Deployment Fails
```
Error: No Netlify configuration found
```
**Solution**: Workflow correctly changes to `apps/frontend` directory

#### Environment Variables Missing
```
VITE_API_URL is undefined
```
**Solution**: 
1. Check GitHub Secrets configuration
2. Verify secret names match exactly
3. Defaults are provided for most variables

#### Supabase Not Configured Error
```
Error: Supabase not configured
```
**Solution**:
1. Ensure you have set both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in GitHub secrets
2. These should NOT be prefixed with `PROD_` - use the exact names above
3. Check browser console for debug output showing which variables are missing
4. The workflow uses these same secrets for both preview and production deployments

#### Security Audit Blocks Build
```
found 3 high severity vulnerabilities
```
**Solution**:
```bash
# Fix automatically
npm audit fix

# If false positive, add to audit-ci.json
{
  "allowlist": ["GHSA-xxx-xxx"]
}
```

#### Cache Not Working
**Symptoms**: Dependencies reinstalled every build
**Solution**:
1. Check `package-lock.json` hasn't changed
2. Verify cache key format
3. Increment `CACHE_VERSION` to reset

#### PR Preview Not Deploying
**Solution**:
1. Check PR is from repository (not fork)
2. Verify Netlify secrets are set
3. Check GitHub Actions permissions

### Debug Commands

```bash
# Local testing
npm run build
npm run lint
npm run type-check

# Netlify CLI testing
netlify build --dry
netlify deploy --dry
netlify status

# Check vulnerabilities
npm audit
npx audit-ci --config audit-ci.json

# Monorepo verification
npm list --workspaces
```

### Useful GitHub CLI Commands

```bash
# View workflow runs
gh run list --workflow=ci.yml

# View specific run logs
gh run view <run-id> --log

# Re-run failed workflow
gh run rerun <run-id>

# List secrets (names only)
gh secret list
```

## GitHub Secrets Troubleshooting

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

## Future Improvements

### Potential Enhancements
- Add E2E testing integration
- Implement Lighthouse CI for performance monitoring
- Set up custom notification webhooks for more detailed alerts
- Consider adding staging environment deployment
- Implement automated rollback on deployment failures

### Maintenance Tasks
- Review and update audit-ci.json allowlist quarterly
- Monitor build times and optimize if they exceed 5 minutes
- Update Node version when LTS changes
- Review and optimize caching strategy based on usage patterns

---

**Document Created**: 2025-07-31
**Purpose**: Track CI/CD issues, troubleshooting steps, and future improvements