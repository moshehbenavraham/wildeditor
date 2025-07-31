# Wildeditor Backend Deployment Guide

This guide covers deploying the FastAPI backend for the Luminari Wilderness Editor.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Actions │───▶│   Docker Image  │───▶│ Production Server│
│   CI/CD Pipeline │    │   (GHCR)        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

### For GitHub Actions Deployment

1. **GitHub Repository Secrets** (Settings → Secrets and variables → Actions):
   ```
   PRODUCTION_HOST=your.server.com
   PRODUCTION_USER=deploy_user
   PRODUCTION_SSH_KEY=your_private_ssh_key
   ```

2. **Production Server Requirements**:
   - Ubuntu 20.04+ or similar Linux distribution
   - Docker and Docker Compose installed
   - Python 3.11+ (for health checks)
   - Nginx (optional, for reverse proxy)
   - MySQL database with spatial extensions

### For Local Development

1. **Required Software**:
   - Docker and Docker Compose
   - Python 3.11+
   - Git

2. **Environment Setup**:
   ```bash
   cd apps/backend
   cp .env.example .env
   # Edit .env with your database credentials
   ```

## 🚀 Deployment Methods

### Method 1: Automatic Deployment via GitHub Actions

1. **Push to main branch** - triggers automatic deployment
2. **Monitor the workflow** in GitHub Actions tab
3. **Verify deployment** at your production URL

The GitHub Actions workflow will:
- Run tests and linting
- Build Docker image
- Push to GitHub Container Registry
- Deploy to your production server
- Run health checks
- Send notifications

### Method 2: Manual Deployment

#### On Production Server:

```bash
# Clone repository
git clone https://github.com/your-username/wildeditor.git
cd wildeditor/apps/backend

# Create production environment file
cp .env.production .env.production
# Edit with your actual values

# Build and deploy
docker build -t wildeditor-backend -f Dockerfile ../..
docker run -d \
  --name wildeditor-backend \
  --restart unless-stopped \
  -p 8000:8000 \
  --env-file .env.production \
  wildeditor-backend
```

#### Using Docker Compose:

```bash
cd apps/backend
docker-compose up -d
```

### Method 3: Local Testing

#### Linux/macOS:
```bash
cd apps/backend
./deploy.sh deploy
```

#### Windows:
```batch
cd apps\backend
deploy.bat deploy
```

## 🔧 Configuration

### Environment Variables

#### Development (.env):
```bash
PORT=8000
ENVIRONMENT=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=luminari_wilderness
DB_USER=wildeditor_user
DB_PASSWORD=your_password
FRONTEND_URL=http://localhost:5173
DEBUG=true
```

#### Production (.env.production):
```bash
PORT=8000
ENVIRONMENT=production
DB_HOST=your.mysql.server.com
DB_PORT=3306
DB_NAME=luminari_wilderness
DB_USER=wildeditor_user
DB_PASSWORD=your_secure_password
FRONTEND_URL=https://wildeditor.luminari.com
DEBUG=false
SECRET_KEY=your_very_secure_secret_key
WORKERS=4
LOG_LEVEL=INFO
```

### Database Setup

1. **Create MySQL database** with spatial extensions
2. **Run the database setup script**:
   ```sql
   -- Copy contents from database-setup.sql
   ```
3. **Create database user**:
   ```sql
   CREATE USER 'wildeditor_user'@'%' IDENTIFIED BY 'secure_password';
   GRANT ALL PRIVILEGES ON luminari_wilderness.* TO 'wildeditor_user'@'%';
   FLUSH PRIVILEGES;
   ```

## 🔍 Monitoring and Debugging

### Health Checks

The API provides several health check endpoints:

```bash
# Basic health check
curl http://localhost:8000/api/health

# Detailed system info (development only)
curl http://localhost:8000/api/health/detailed
```

### Logging

#### Docker Logs:
```bash
docker logs wildeditor-backend
```

#### Application Logs:
```bash
# If LOG_FILE is configured
tail -f /var/log/wildeditor/backend.log
```

### Performance Monitoring

#### Container Stats:
```bash
docker stats wildeditor-backend
```

#### Database Connections:
```sql
SHOW PROCESSLIST;
SHOW STATUS LIKE 'Threads_connected';
```

## 🔒 Security Considerations

### Production Checklist:

- [ ] **Environment Variables**: All secrets in `.env.production`
- [ ] **Database Security**: Strong passwords, limited user privileges
- [ ] **Container Security**: Non-root user, minimal base image
- [ ] **Network Security**: Firewall configured, only necessary ports open
- [ ] **SSL/TLS**: HTTPS enabled with valid certificates
- [ ] **CORS**: Properly configured for your frontend domain
- [ ] **API Documentation**: Disabled in production (`ENABLE_DOCS=false`)
- [ ] **Logging**: Sensitive data not logged
- [ ] **Updates**: Regular security updates for base images and dependencies

### Nginx Reverse Proxy (Recommended):

```nginx
server {
    listen 80;
    server_name api.wildeditor.luminari.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 🐛 Troubleshooting

### Common Issues:

#### Container Won't Start:
```bash
# Check logs
docker logs wildeditor-backend

# Check if port is in use
netstat -tlnp | grep 8000

# Verify environment file
cat .env.production
```

#### Database Connection Failed:
```bash
# Test database connectivity from container
docker exec -it wildeditor-backend python -c "
import pymysql
conn = pymysql.connect(host='your_host', user='your_user', password='your_pass')
print('Database connection successful!')
"
```

#### Health Check Failing:
```bash
# Test health endpoint directly
curl -v http://localhost:8000/api/health

# Check container networking
docker inspect wildeditor-backend | grep -A 5 NetworkSettings
```

### Performance Issues:

#### High Memory Usage:
- Increase server resources
- Check for memory leaks in application logs
- Monitor database connection pooling

#### Slow API Responses:
- Check database performance
- Review API endpoint efficiency
- Monitor container resource usage

#### High CPU Usage:
- Check for infinite loops in application code
- Review database query performance
- Consider scaling with multiple workers

## 📊 Scaling and Performance

### Horizontal Scaling:

```bash
# Run multiple containers with load balancer
docker run -d --name wildeditor-backend-1 -p 8001:8000 ...
docker run -d --name wildeditor-backend-2 -p 8002:8000 ...
docker run -d --name wildeditor-backend-3 -p 8003:8000 ...
```

### Vertical Scaling:

```bash
# Increase container resources
docker run -d \
  --memory=2g \
  --cpus=2 \
  --name wildeditor-backend \
  ...
```

### Database Optimization:

```sql
-- Add indexes for better performance
CREATE INDEX idx_region_zone ON region_data(zone_vnum);
CREATE INDEX idx_path_zone ON path_data(zone_vnum);
CREATE SPATIAL INDEX idx_region_polygon ON region_data(region_polygon);
CREATE SPATIAL INDEX idx_path_linestring ON path_data(path_linestring);
```

## 🔄 Updates and Maintenance

### Automated Updates (via GitHub Actions):
1. Push changes to `main` branch
2. GitHub Actions automatically deploys
3. Health checks verify deployment
4. Rollback manually if needed

### Manual Updates:
```bash
# Pull latest changes
git pull

# Rebuild and deploy
./deploy.sh deploy

# Or using Docker Compose
docker-compose down
docker-compose up -d --build
```

### Backup Strategy:
```bash
# Database backup
mysqldump -u wildeditor_user -p luminari_wilderness > backup_$(date +%Y%m%d).sql

# Container backup
docker export wildeditor-backend > backend_backup_$(date +%Y%m%d).tar
```

## 📞 Support

- **Documentation**: Check this README and inline comments
- **Logs**: Always check application and container logs first
- **GitHub Issues**: Report bugs and feature requests
- **Health Checks**: Use built-in health endpoints for diagnostics

---

For more detailed information, see the individual configuration files and the main project documentation.
