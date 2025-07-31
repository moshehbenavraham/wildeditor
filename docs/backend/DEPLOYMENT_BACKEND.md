# Backend Deployment Guide - Luminari Wilderness Editor

This guide covers backend-specific deployment procedures for the Python FastAPI backend.

> **Related Documentation:**
> - 📚 [Main Deployment Guide](../DEPLOYMENT.md) - Overview and shared configurations
> - 🎨 [Frontend Deployment](../frontend/DEPLOYMENT_FRONTEND.md) - Frontend-specific deployment
> - 🚀 [Quick Deployment Reference](../../DEPLOYMENT-QUICK.md) - Command cheat sheet
> - 🛠️ [Setup Guide](../../SETUP.md) - Local development setup

## 🖥️ Backend Technology Stack

- **Framework**: Python FastAPI 
- **Server**: Uvicorn ASGI
- **Database**: MySQL (direct integration with LuminariMUD)
- **ORM**: SQLAlchemy
- **Validation**: Pydantic
- **Authentication**: JWT tokens (optional)

## 🚀 Quick Start - Backend Deployment

### Coolify (Python FastAPI)
```bash
# Build pack: docker-compose
# Compose file: docker-compose.prod.yml

# Required environment variables:
MYSQL_DATABASE_URL=mysql+pymysql://user:pass@host/database
FRONTEND_URL=https://your-frontend-domain.com
JWT_SECRET=your-secret-key
```

### Docker Deployment
```bash
# Build and run
docker build -t wildeditor-backend .
docker run -p 8000:8000 --env-file .env wildeditor-backend
```

## 📋 Environment Configuration

### Backend Environment Variables (.env.production)
```bash
# Database Configuration (MySQL)
MYSQL_DATABASE_URL=mysql+pymysql://user:password@luminari-mysql-host:port/database
DATABASE_POOL_SIZE=20
DATABASE_TIMEOUT=30

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=4
CORS_ORIGINS=https://wildeditor.luminari.com

# Authentication (optional)
JWT_SECRET=your-super-secret-jwt-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION=86400

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=INFO
```

## 🐳 Docker Deployment

### Production Dockerfile
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
COPY apps/backend/src/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY apps/backend/src .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
USER app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1

# Start application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose Configuration
```yaml
version: '3.8'

services:
  api:
    build: 
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - MYSQL_DATABASE_URL=${MYSQL_DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
    depends_on:
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

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
```

## 🌐 Platform-Specific Deployments

### AWS EC2 Deployment

#### Setup Script
```bash
#!/bin/bash
# setup-ec2.sh

# Update system
sudo yum update -y

# Install Docker
sudo amazon-linux-extras install docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Python 3.11
sudo yum install python311 python311-pip -y

# Clone repository
cd /home/ec2-user
git clone https://github.com/yourusername/wildeditor.git
cd wildeditor

# Set up environment
cp apps/backend/.env.example apps/backend/.env
# Edit .env with production values

# Start services
cd apps/backend
docker-compose -f docker-compose.prod.yml up -d
```

### Google Cloud Run Deployment

#### cloudbuild.yaml
```yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/wildeditor-api', '-f', 'apps/backend/Dockerfile', '.']

  # Push to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/wildeditor-api']

  # Deploy to Cloud Run
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
      - '--set-env-vars'
      - 'MYSQL_DATABASE_URL=${_MYSQL_DATABASE_URL}'

images:
  - 'gcr.io/$PROJECT_ID/wildeditor-api'
```

### DigitalOcean App Platform

#### app.yaml
```yaml
name: wildeditor-backend
services:
- name: api
  github:
    repo: yourusername/wildeditor
    branch: main
    deploy_on_push: true
  dockerfile_path: apps/backend/Dockerfile
  http_port: 8000
  instance_count: 1
  instance_size_slug: basic-xxs
  routes:
  - path: /
  envs:
  - key: MYSQL_DATABASE_URL
    scope: RUN_TIME
    value: ${db.DATABASE_URL}
  - key: JWT_SECRET
    scope: RUN_TIME
    type: SECRET
  health_check:
    http_path: /api/health
```

## 🗄️ Database Configuration

### MySQL Setup for Production

```sql
-- Create database with proper charset
CREATE DATABASE IF NOT EXISTS luminari_wilderness 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Create user with limited privileges
CREATE USER IF NOT EXISTS 'wildeditor'@'%' 
  IDENTIFIED BY 'strong_password_here';

-- Grant necessary privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON luminari_wilderness.* 
  TO 'wildeditor'@'%';

-- Enable spatial support
SET GLOBAL log_bin_trust_function_creators = 1;

-- Performance optimizations
SET GLOBAL innodb_buffer_pool_size = 2147483648; -- 2GB
SET GLOBAL max_connections = 200;
SET GLOBAL query_cache_size = 67108864; -- 64MB
```

### Database Migration Script
```bash
#!/bin/bash
# migrate-db.sh

# Run Alembic migrations
cd apps/backend/src
alembic upgrade head

# Verify migration
python -c "
from sqlalchemy import create_engine
from config import settings
engine = create_engine(settings.database_url)
with engine.connect() as conn:
    result = conn.execute('SHOW TABLES')
    print('Tables:', [row[0] for row in result])
"
```

## 🔒 Security Configuration

### Nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name api.wildeditor.luminari.com;

    ssl_certificate /etc/letsencrypt/live/api.wildeditor.luminari.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.wildeditor.luminari.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers handled by FastAPI
    }
    
    location /api/health {
        proxy_pass http://localhost:8000/api/health;
        access_log off;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.wildeditor.luminari.com;
    return 301 https://$server_name$request_uri;
}
```

### Firewall Rules (UFW)
```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow MySQL only from app servers
sudo ufw allow from 10.0.1.0/24 to any port 3306

# Enable firewall
sudo ufw --force enable
```

## 📊 Monitoring and Health Checks

### Health Check Implementation
```python
# main.py
from fastapi import FastAPI
from sqlalchemy import text
from database import engine

app = FastAPI()

@app.get("/api/health")
async def health_check():
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "checks": {}
    }
    
    # Check database connection
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        health_status["checks"]["database"] = "healthy"
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["checks"]["database"] = f"error: {str(e)}"
    
    return health_status
```

### Monitoring Setup
```bash
# Install monitoring agent
curl -sSL https://repos.insights.digitalocean.com/install.sh | sudo bash

# Configure logging
cat > /etc/rsyslog.d/wildeditor.conf << EOF
:programname, isequal, "wildeditor" /var/log/wildeditor/app.log
& stop
EOF

# Log rotation
cat > /etc/logrotate.d/wildeditor << EOF
/var/log/wildeditor/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 app app
}
EOF
```

## 🔄 CI/CD Pipeline

### GitHub Actions - Backend Deployment
```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'apps/backend/**'
      - '.github/workflows/deploy-backend.yml'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
          
      - name: Install dependencies
        run: |
          cd apps/backend/src
          pip install -r requirements.txt
          pip install pytest pytest-cov
          
      - name: Run tests
        run: |
          cd apps/backend/src
          pytest tests/ --cov=./ --cov-report=xml
          
      - name: Run linting
        run: |
          cd apps/backend/src
          pylint *.py

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.BACKEND_HOST }}
          username: ${{ secrets.BACKEND_USER }}
          key: ${{ secrets.BACKEND_SSH_KEY }}
          script: |
            cd /home/deploy/wildeditor
            git pull origin main
            cd apps/backend
            docker-compose -f docker-compose.prod.yml build
            docker-compose -f docker-compose.prod.yml up -d
            docker system prune -f
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Test MySQL connection
mysql -h your-host -u wildeditor -p -e "SELECT 1"

# Check Python connection
cd apps/backend/src
python -c "
from sqlalchemy import create_engine
engine = create_engine('mysql+pymysql://user:pass@host/db')
engine.connect()
print('Connection successful')
"
```

#### Port Already in Use
```bash
# Find process using port 8000
sudo lsof -i :8000

# Kill the process
sudo kill -9 <PID>
```

#### Docker Issues
```bash
# View logs
docker-compose logs -f api

# Restart services
docker-compose restart api

# Rebuild containers
docker-compose build --no-cache
```

### Performance Optimization

```bash
# Monitor resource usage
htop
docker stats

# Check slow queries
mysql -e "SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10"

# Optimize database
mysqlcheck -o luminari_wilderness
```

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [MySQL Spatial Documentation](https://dev.mysql.com/doc/refman/8.0/en/spatial-types.html)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

> **Need Help?** Check the [Main Deployment Guide](../DEPLOYMENT.md) for overview and shared configurations, or the [Frontend Deployment Guide](../frontend/DEPLOYMENT_FRONTEND.md) for frontend-specific information.