# Deployment Guide - Luminari Wilderness Editor

This guide covers deployment procedures, environment setup, and configuration for the Luminari Wilderness Editor.

## 🚀 Quick Start Deployments

### Frontend → Netlify (Current)
1. Connect GitHub repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist` 
4. Set environment variables from `.env.production.example`

### Backend → Coolify (Current Express)
1. Connect repository, select `docker-compose` build pack
2. Use `docker-compose.prod.yml`  
3. Set environment variables: `FRONTEND_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
4. Deploy automatically with health checks

## 🚀 Deployment Overview

### Deployment Architecture

```
DEVELOPMENT:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Express API   │    │   Supabase      │
│   (Netlify)     │◄──►│   (TEMPORARY)   │◄──►│   PostgreSQL    │
│                 │    │                 │    │                 │
│ - React Build   │    │ - Authentication│    │ - Development   │
│ - Static Assets │    │ - API Endpoints │    │ - Local Changes │
│ - CDN Caching   │    │ - JWT Tokens    │    │ - Temp Storage  │
└─────────────────┘    └─────────────────┘    └─────────────────┘

PRODUCTION (Future):
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Python API    │    │ LuminariMUD     │
│   (CDN/Static)  │◄──►│   (FastAPI)     │◄──►│   MySQL         │
│                 │    │                 │    │                 │
│ - React Build   │    │ - Authentication│    │ - Game Tables   │
│ - Static Assets │    │ - API Endpoints │    │ - Spatial Data  │
│ - Caching       │    │ - Rate Limiting │    │ - Live Game DB  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Supported Platforms

**Development/Current:**
- **Frontend**: Netlify (current), Vercel, AWS S3 + CloudFront
- **Backend**: Express.js (TEMPORARY) - any Node.js hosting
- **Database**: Supabase PostgreSQL (development only)

**Production/Future:**
- **Frontend**: Same as development
- **Backend**: Python FastAPI - AWS EC2, Google Cloud Run, DigitalOcean
- **Database**: Direct connection to LuminariMUD's existing MySQL server

## 🏗️ Environment Setup

### Environment Variables

Create environment files for each deployment stage:

#### Frontend (.env.production)
```bash
# API Configuration
VITE_API_URL=https://api.wildeditor.luminari.com
VITE_WS_URL=wss://api.wildeditor.luminari.com/ws

# Authentication
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Feature Flags
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true

# Map Configuration
VITE_MAP_BASE_URL=https://maps.wildeditor.luminari.com
VITE_DEFAULT_ZOOM=1
VITE_MAX_ZOOM=4
```

#### Backend (.env.production)
```bash
# Current Express Backend (TEMPORARY)
PORT=3001
NODE_ENV=production
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
FRONTEND_URL=https://wildedit.luminarimud.com

# Future Python Backend (Production)
DATABASE_URL=mysql://user:password@luminari-mysql-host:port/database
DATABASE_POOL_SIZE=20
DATABASE_TIMEOUT=30

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=86400

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=4
CORS_ORIGINS=https://wildeditor.luminari.com

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=INFO
```

## 📦 Frontend Deployment (Monorepo)

### Build Process

1. **Install dependencies**
   ```bash
   npm ci --production
   ```

2. **Build frontend package**
   ```bash
   npm run build:frontend
   # Or build all packages: npm run build
   ```

3. **Verify build**
   ```bash
   npm run preview --workspace=@wildeditor/frontend
   ```

### Netlify Deployment

#### Required Netlify Environment Variables

Set these in **Netlify Dashboard** → **Site configuration** → **Environment variables**:

```bash
# Required for production build
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=https://your-backend-api-url/api

# Application settings  
VITE_APP_NAME=Luminari Wilderness Editor
VITE_ENVIRONMENT=production
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
```

#### Required GitHub Repository Secrets

Set these in **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions**:

```bash
# Netlify deployment secrets
NETLIFY_AUTH_TOKEN=your_netlify_personal_access_token
NETLIFY_PROD_SITE_ID=your_netlify_site_id

# Slack notifications (for CI/CD pipeline)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Supabase secrets (for GitHub Actions builds)
PROD_SUPABASE_URL=your_production_supabase_url
PROD_SUPABASE_ANON_KEY=your_production_supabase_anon_key
PROD_API_URL=https://your-backend-api-url/api
```

#### How to Find Netlify Values:

**1. Netlify Auth Token:**
- Go to https://app.netlify.com/user/applications#personal-access-tokens
- Click **New access token**
- Name it "GitHub Actions" and generate
- Copy immediately (you won't see it again)

**2. Netlify Site ID:**
- In your site dashboard: **Site configuration** → **General**
- Scroll to **Project information** 
- Copy the **Site ID** (format: abc123def-456g-789h-012i-jklmnopqrstu)

#### netlify.toml
```toml
[build]
  publish = "apps/frontend/dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"

[[redirects]]
  from = "/api/*"
  to = "https://api.wildeditor.luminari.com/:splat"
  status = 200

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
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.supabase.com"

# Cache static assets
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

#### Deployment Steps
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to staging
netlify deploy --dir=dist

# Deploy to production
netlify deploy --prod --dir=dist
```

### Vercel Deployment

#### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://api.wildeditor.luminari.com/api/$1"
    }
  ],
  "headers": [
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
        }
      ]
    }
  ]
}
```

#### Deployment Steps
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### AWS S3 + CloudFront

#### Build and Deploy Script
```bash
#!/bin/bash
# deploy-aws.sh

# Build the application
npm run build

# Sync to S3
aws s3 sync dist/ s3://wildeditor-frontend --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E1234567890123 \
  --paths "/*"

echo "Deployment complete!"
```

#### CloudFront Configuration
```json
{
  "Origins": [
    {
      "DomainName": "wildeditor-frontend.s3.amazonaws.com",
      "Id": "S3-wildeditor-frontend",
      "S3OriginConfig": {
        "OriginAccessIdentity": "origin-access-identity/cloudfront/E1234567890123"
      }
    }
  ],
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-wildeditor-frontend",
    "ViewerProtocolPolicy": "redirect-to-https",
    "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
  },
  "CustomErrorResponses": [
    {
      "ErrorCode": 404,
      "ResponseCode": 200,
      "ResponsePagePath": "/index.html"
    }
  ]
}
```

## 🖥️ Backend Deployment

### Coolify Deployment (Recommended for Current Express Backend)

#### Option 1: Docker Compose (Recommended)

**Setup:**
1. **Connect Repository**: Add your Git repository to Coolify
2. **Build Pack**: Select `docker-compose`
3. **Compose File**: Use `docker-compose.prod.yml`
4. **Environment Variables**: Set these in Coolify dashboard:
   ```
   FRONTEND_URL=https://your-frontend-domain.com
   SUPABASE_URL=your_production_supabase_url
   SUPABASE_SERVICE_KEY=your_production_supabase_service_role_key
   ```

**Features:**
- Multi-stage Docker build for optimized production images
- Built-in health checks at `/api/health`
- Auto-restart with `unless-stopped` policy
- Proper container networking and security

#### Option 2: Simple Dockerfile
1. **Build Pack**: Select `dockerfile`
2. **Dockerfile Location**: `./Dockerfile`
3. **Same Environment Variables** as Docker Compose

#### Option 3: Nixpacks Auto-Detection
1. **Build Pack**: Select `nixpacks`
2. **Auto-detected Commands**: `npm run build` and `npm start`
3. **Port**: 3001 (auto-detected)

**Deployment Process:**
Coolify automatically:
- Installs monorepo dependencies correctly
- Builds only the backend workspace  
- Starts Express server with proper health monitoring
- Handles CORS, networking, and container management

**Pre-Deployment Checklist:**
- [ ] Production Supabase project created
- [ ] Database tables created (run `database-setup.sql`)
- [ ] Service role key obtained from Supabase
- [ ] Frontend domain configured for CORS
- [ ] Environment variables set in Coolify

### Docker Deployment

#### Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
USER app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=mysql://user:password@db:3306/wildeditor
      - JWT_SECRET=${JWT_SECRET}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=wildeditor
      - MYSQL_USER=wildeditor
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3306:3306"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    restart: unless-stopped

volumes:
  mysql_data:
```

### AWS EC2 Deployment

#### User Data Script
```bash
#!/bin/bash
# EC2 user data script

# Update system
yum update -y

# Install Docker
amazon-linux-extras install docker
service docker start
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Clone repository
cd /home/ec2-user
git clone https://github.com/moshehbenavraham/wildeditor-backend.git
cd wildeditor-backend

# Set up environment
cp .env.example .env
# Edit .env with production values

# Start services
docker-compose up -d

# Set up log rotation
cat > /etc/logrotate.d/wildeditor << EOF
/home/ec2-user/wildeditor-backend/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 ec2-user ec2-user
}
EOF
```

### Google Cloud Run Deployment

#### cloudbuild.yaml
```yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/wildeditor-api', '.']

  # Push the container image to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/wildeditor-api']

  # Deploy container image to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'wildeditor-api'
      - '--image'
      - 'gcr.io/$PROJECT_ID/wildeditor-api'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'

images:
  - 'gcr.io/$PROJECT_ID/wildeditor-api'
```

#### Deployment Commands
```bash
# Set up gcloud
gcloud auth login
gcloud config set project your-project-id

# Deploy
gcloud builds submit --config cloudbuild.yaml

# Set environment variables
gcloud run services update wildeditor-api \
  --set-env-vars DATABASE_URL="mysql://..." \
  --set-env-vars JWT_SECRET="..." \
  --region us-central1
```

## 🗄️ Database Setup

### MySQL Configuration

#### Production Configuration
```sql
-- Create database and user
CREATE DATABASE wildeditor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'wildeditor'@'%' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON wildeditor.* TO 'wildeditor'@'%';
FLUSH PRIVILEGES;

-- Enable spatial extensions
SET GLOBAL log_bin_trust_function_creators = 1;

-- Optimize for spatial queries
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB
SET GLOBAL max_connections = 200;
SET GLOBAL query_cache_size = 67108864; -- 64MB
```

#### Migration Script
```sql
-- migrations/001_initial_schema.sql
CREATE TABLE region_data (
    vnum INT PRIMARY KEY,
    zone_vnum INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    region_type INT NOT NULL,
    region_polygon GEOMETRY NOT NULL,
    region_props INT DEFAULT 0,
    region_reset_data TEXT,
    region_reset_time INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    SPATIAL INDEX(region_polygon),
    INDEX idx_zone_vnum (zone_vnum),
    INDEX idx_region_type (region_type)
);

CREATE TABLE path_data (
    vnum INT PRIMARY KEY,
    zone_vnum INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    path_type INT NOT NULL,
    path_linestring GEOMETRY NOT NULL,
    path_props INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    SPATIAL INDEX(path_linestring),
    INDEX idx_zone_vnum (zone_vnum),
    INDEX idx_path_type (path_type)
);

-- Editor-specific tables
CREATE TABLE editor_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    session_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
);

CREATE TABLE editor_commits (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    commit_message TEXT,
    changes JSON,
    committed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_committed_at (committed_at)
);
```

### Backup Strategy

#### Automated Backup Script
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/wildeditor"
DB_NAME="wildeditor"
DB_USER="wildeditor"
DB_PASS="password"
DB_HOST="localhost"

# Create backup directory
mkdir -p $BACKUP_DIR

# Dump database
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASS \
  --single-transaction \
  --routines \
  --triggers \
  $DB_NAME > $BACKUP_DIR/wildeditor_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/wildeditor_$DATE.sql

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/wildeditor_$DATE.sql.gz \
  s3://wildeditor-backups/database/

# Clean up old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: wildeditor_$DATE.sql.gz"
```

#### Cron Job Setup
```bash
# Add to crontab
0 2 * * * /path/to/backup.sh >> /var/log/wildeditor-backup.log 2>&1
```

## 🔒 Security Configuration

### SSL/TLS Setup

#### Let's Encrypt with Certbot
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d wildeditor.luminari.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Nginx SSL Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name wildeditor.luminari.com;

    ssl_certificate /etc/letsencrypt/live/wildeditor.luminari.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wildeditor.luminari.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Firewall Configuration

#### UFW Setup
```bash
# Enable firewall
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow database (only from app servers)
sudo ufw allow from 10.0.1.0/24 to any port 3306

# Deny all other traffic
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

## 📊 Monitoring and Logging

### Application Monitoring

#### Health Check Endpoint
```python
# health.py
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "database": await check_database_connection(),
        "redis": await check_redis_connection()
    }
```

#### Monitoring Script
```bash
#!/bin/bash
# monitor.sh

URL="https://api.wildeditor.luminari.com/health"
WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"

response=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ $response -ne 200 ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"🚨 Wildeditor API is down! HTTP status: '$response'"}' \
        $WEBHOOK_URL
fi
```

### Log Management

#### Structured Logging Configuration
```python
# logging_config.py
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        if hasattr(record, 'user_id'):
            log_entry['user_id'] = record.user_id
            
        if hasattr(record, 'request_id'):
            log_entry['request_id'] = record.request_id
            
        return json.dumps(log_entry)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('/var/log/wildeditor/app.log')
    ]
)

for handler in logging.root.handlers:
    handler.setFormatter(JSONFormatter())
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

#### .github/workflows/deploy.yml
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

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
        
      - name: Run linting
        run: npm run lint

  deploy-frontend:
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
        uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: './dist'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /home/ubuntu/wildeditor-backend
            git pull origin main
            docker-compose down
            docker-compose up -d --build
            docker system prune -f
```

## 🚨 Troubleshooting

### Common Deployment Issues

#### Frontend Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check

# Verify environment variables
echo $VITE_API_URL
```

#### Backend Connection Issues
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs api

# Test database connection
docker-compose exec api python -c "
import mysql.connector
conn = mysql.connector.connect(
    host='db',
    user='wildeditor',
    password='password',
    database='wildeditor'
)
print('Database connection successful')
"
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run

# Test SSL configuration
openssl s_client -connect wildeditor.luminari.com:443
```

### Performance Issues

#### Database Optimization
```sql
-- Check slow queries
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;

-- Analyze table performance
ANALYZE TABLE region_data;
ANALYZE TABLE path_data;

-- Check index usage
EXPLAIN SELECT * FROM region_data WHERE zone_vnum = 10000;
```

#### Application Performance
```bash
# Monitor resource usage
htop
iotop
nethogs

# Check application metrics
curl https://api.wildeditor.luminari.com/metrics

# Profile memory usage
docker stats
```

This deployment guide provides comprehensive instructions for deploying the Luminari Wilderness Editor to production environments. Follow the security best practices and monitoring guidelines to ensure a stable and secure deployment.
