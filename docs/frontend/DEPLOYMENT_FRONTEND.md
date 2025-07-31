# Frontend Deployment Guide - Luminari Wilderness Editor

This guide covers frontend-specific deployment procedures for the React/TypeScript application.

> **Related Documentation:**
> - 📚 [Main Deployment Guide](../DEPLOYMENT.md) - Overview and shared configurations
> - 🖥️ [Backend Deployment](../backend/DEPLOYMENT_BACKEND.md) - Backend-specific deployment
> - 🚀 [Quick Deployment Reference](../../DEPLOYMENT-QUICK.md) - Command cheat sheet
> - 🛠️ [Setup Guide](../../SETUP.md) - Local development setup

## 🎨 Frontend Technology Stack

- **Framework**: React 18.3+ with TypeScript 5.5+
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks
- **API Client**: Custom fetch-based client

## 🚀 Quick Start - Frontend Deployment

### Netlify Deployment
```bash
# Build command
npm run build

# Publish directory
apps/frontend/dist

# Environment variables required:
VITE_API_URL=https://api.wildeditor.luminari.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Vercel Deployment
```bash
# Framework preset: Vite
# Build command: npm run build
# Output directory: apps/frontend/dist
```

## 📋 Environment Configuration

### Frontend Environment Variables (.env.production)
```bash
# API Configuration
VITE_API_URL=https://api.wildeditor.luminari.com
VITE_WS_URL=wss://api.wildeditor.luminari.com/ws

# Authentication (optional)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Feature Flags
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true

# Application Settings
VITE_APP_NAME=Luminari Wilderness Editor
VITE_ENVIRONMENT=production

# Map Configuration
VITE_MAP_BASE_URL=https://maps.wildeditor.luminari.com
VITE_DEFAULT_ZOOM=1
VITE_MAX_ZOOM=4
```

## 📦 Build Process

### Building for Production
```bash
# Install dependencies
npm ci --production

# Build frontend package
npm run build:frontend

# Verify build output
ls -la apps/frontend/dist
```

### Build Optimization
The Vite build process automatically:
- Minifies JavaScript and CSS
- Splits code for optimal loading
- Generates source maps for debugging
- Optimizes images and assets
- Creates immutable asset hashes

## 🌐 Platform Deployments

### Netlify Deployment (Recommended)

#### netlify.toml Configuration
```toml
[build]
  base = "."
  publish = "apps/frontend/dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"

# API proxy redirect
[[redirects]]
  from = "/api/*"
  to = "https://api.wildeditor.luminari.com/:splat"
  status = 200
  force = true

# SPA fallback
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.supabase.com wss://*.supabase.com https://api.wildeditor.luminari.com"

# Cache static assets
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

#### Required Netlify Settings

**Environment Variables (Netlify Dashboard)**:
1. Go to **Site settings** → **Environment variables**
2. Add the following:
```bash
VITE_API_URL=https://api.wildeditor.luminari.com
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_APP_NAME=Luminari Wilderness Editor
VITE_ENVIRONMENT=production
VITE_ENABLE_DEBUG=false
```

**Deploy Settings**:
- **Base directory**: (leave empty)
- **Build command**: `npm run build`
- **Publish directory**: `apps/frontend/dist`
- **Functions directory**: (leave empty)

#### Deployment via CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site (first time only)
netlify init

# Deploy to preview
netlify deploy --dir=apps/frontend/dist

# Deploy to production
netlify deploy --prod --dir=apps/frontend/dist
```

### Vercel Deployment

#### vercel.json Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "apps/frontend/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://api.wildeditor.luminari.com/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

#### Deployment via CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# Deploy to production
vercel --prod
```

### AWS S3 + CloudFront

#### S3 Bucket Configuration
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::wildeditor-frontend/*"
    }
  ]
}
```

#### CloudFront Distribution
```json
{
  "Origins": [{
    "DomainName": "wildeditor-frontend.s3.amazonaws.com",
    "Id": "S3-wildeditor-frontend",
    "S3OriginConfig": {
      "OriginAccessIdentity": "origin-access-identity/cloudfront/E123456"
    }
  }],
  "DefaultRootObject": "index.html",
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-wildeditor-frontend",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": ["GET", "HEAD"],
    "Compress": true,
    "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6"
  },
  "CustomErrorResponses": [
    {
      "ErrorCode": 403,
      "ResponseCode": 200,
      "ResponsePagePath": "/index.html"
    },
    {
      "ErrorCode": 404,
      "ResponseCode": 200,
      "ResponsePagePath": "/index.html"
    }
  ]
}
```

#### Deployment Script
```bash
#!/bin/bash
# deploy-aws.sh

# Build the application
npm run build

# Sync to S3
aws s3 sync apps/frontend/dist/ s3://wildeditor-frontend \
  --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "index.html" \
  --exclude "*.json"

# Upload index.html with no-cache
aws s3 cp apps/frontend/dist/index.html s3://wildeditor-frontend/index.html \
  --cache-control "public,max-age=0,must-revalidate"

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E1234567890123 \
  --paths "/*"

echo "Deployment complete!"
```

### GitHub Pages Deployment

#### GitHub Actions Workflow
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
    paths:
      - 'apps/frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: https://api.wildeditor.luminari.com
          
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./apps/frontend/dist
          cname: wildeditor.luminari.com
```

## 🔒 Security Configuration

### Content Security Policy
```javascript
// vite.config.ts
export default defineConfig({
  // ... other config
  html: {
    cspNonce: true,
    csp: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", "data:", "https:"],
      'font-src': ["'self'", "data:"],
      'connect-src': [
        "'self'",
        "https://*.supabase.co",
        "https://api.wildeditor.luminari.com",
        "wss://api.wildeditor.luminari.com"
      ]
    }
  }
})
```

### Environment Variable Security
- Never commit `.env` files to version control
- Use platform-specific secret management
- Rotate API keys regularly
- Use read-only keys for frontend when possible

## 📊 Performance Optimization

### Build Optimizations
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react'],
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
```

### Asset Optimization
```bash
# Pre-compress assets
find dist -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) \
  -exec gzip -9 -k {} \; \
  -exec brotli -9 -k {} \;
```

### Lazy Loading Routes
```typescript
// App.tsx
import { lazy, Suspense } from 'react';

const MapEditor = lazy(() => import('./components/MapEditor'));
const Settings = lazy(() => import('./components/Settings'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<MapEditor />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions - Frontend Deployment
```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'apps/frontend/**'
      - 'packages/shared/**'
      - '.github/workflows/deploy-frontend.yml'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Type check
        run: npm run type-check
        
      - name: Lint
        run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: './apps/frontend/dist'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf node_modules apps/frontend/node_modules
rm package-lock.json
npm install
npm run build

# Check for TypeScript errors
npm run type-check

# Check for missing environment variables
grep -r "import.meta.env" apps/frontend/src
```

#### Environment Variables Not Working
```bash
# Verify .env file location
ls -la apps/frontend/.env*

# Check variable names (must start with VITE_)
cat apps/frontend/.env | grep -v "^VITE_"

# Test build with variables
VITE_API_URL=test npm run build
```

#### Routing Issues (404 on refresh)
Ensure your hosting platform is configured for SPA routing:
- Netlify: Use `_redirects` or `netlify.toml`
- Vercel: Use `vercel.json` rewrites
- Apache: Use `.htaccess` with mod_rewrite
- Nginx: Configure try_files directive

### Performance Issues

#### Bundle Size Analysis
```bash
# Analyze bundle size
npm run build -- --analyze

# Check chunk sizes
ls -lah apps/frontend/dist/assets/*.js
```

#### Lighthouse Audit
```bash
# Run Lighthouse CI
npm install -g @lhci/cli
lhci autorun
```

## 🔍 Monitoring

### Error Tracking (Sentry)
```typescript
// main.tsx
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}
```

### Analytics Integration
```html
<!-- index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Netlify Documentation](https://docs.netlify.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [AWS S3 Static Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

---

> **Need Help?** Check the [Main Deployment Guide](../DEPLOYMENT.md) for overview and shared configurations, or the [Backend Deployment Guide](../backend/DEPLOYMENT_BACKEND.md) for backend-specific information.