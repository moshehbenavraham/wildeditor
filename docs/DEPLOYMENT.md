# Deployment Guide - Luminari Wilderness Editor

This guide provides an overview of deployment procedures for the Luminari Wilderness Editor full-stack application.

## 📚 Deployment Documentation Structure

### Specialized Deployment Guides
- 🎨 **[Frontend Deployment Guide](./frontend/DEPLOYMENT_FRONTEND.md)** - React/TypeScript frontend deployment
- 🖥️ **[Backend Deployment Guide](./backend/DEPLOYMENT_BACKEND.md)** - Python FastAPI backend deployment
- 🚀 **[Quick Deployment Reference](./DEPLOYMENT-QUICK.md)** - Command cheat sheet for experienced developers
- 🛠️ **[Setup Guide](./SETUP.md)** - Local development environment setup

## 🏗️ Architecture Overview

The Luminari Wilderness Editor is a full-stack application with separate frontend and backend deployments:

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Frontend          │    │   Backend API       │    │   Database          │
│   (React/TS)        │◄──►│   (Python FastAPI)  │◄──►│   (MySQL)           │
│                     │    │                     │    │                     │
│ - Static hosting    │    │ - API server        │    │ - LuminariMUD DB    │
│ - CDN distribution  │    │ - Authentication    │    │ - Spatial data      │
│ - SPA routing       │    │ - WebSocket support │    │ - Game integration  │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

## 🚀 Quick Start Deployments

### Frontend → Netlify
```bash
# Build command: npm run build
# Publish directory: apps/frontend/dist
# See Frontend Deployment Guide for details
```

### Backend → Docker/Cloud
```bash
# Python FastAPI with Docker
docker-compose -f docker-compose.prod.yml up -d
# See Backend Deployment Guide for details
```

## 🌐 Deployment Environments

### Development Environment
- **Frontend**: Local development server (Vite)
- **Backend**: Local Python FastAPI server
- **Database**: MySQL development instance or Docker container

### Staging Environment
- **Frontend**: Netlify preview deployments
- **Backend**: Staging server with test database
- **Database**: Staging MySQL instance

### Production Environment
- **Frontend**: CDN-hosted static site (Netlify/Vercel/CloudFront)
- **Backend**: Cloud-hosted API (AWS/GCP/DigitalOcean)
- **Database**: LuminariMUD production MySQL server

## 📋 Pre-Deployment Checklist

### General Requirements
- [ ] Git repository with proper branch structure
- [ ] Environment variables configured for each environment
- [ ] SSL certificates configured (Let's Encrypt recommended)
- [ ] Domain names configured and DNS pointing correctly
- [ ] Monitoring and logging solutions in place

### Frontend Requirements
- [ ] Production build tested locally
- [ ] Environment variables set in hosting platform
- [ ] API URL correctly configured
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured (if applicable)

### Backend Requirements
- [ ] Database connection tested and verified
- [ ] CORS configuration matches frontend domain
- [ ] Authentication system configured
- [ ] Health check endpoints working
- [ ] Rate limiting configured

## 🔒 Security Considerations

### Frontend Security
- Content Security Policy headers
- HTTPS enforcement
- Secure cookie settings
- API key protection (use environment variables)

### Backend Security
- Database connection encryption
- API rate limiting
- Input validation and sanitization
- JWT token security
- Firewall configuration

### Cross-Origin Resource Sharing (CORS)
```python
# Backend CORS configuration example
CORS_ORIGINS = [
    "https://wildeditor.luminari.com",
    "https://www.wildeditor.luminari.com",
    "http://localhost:5173"  # Development only
]
```

## 📊 Monitoring and Logging

### Application Monitoring
- **Frontend**: Error tracking, performance monitoring, user analytics
- **Backend**: API metrics, response times, error rates
- **Database**: Query performance, connection pool metrics

### Recommended Tools
- **Error Tracking**: Sentry
- **Performance**: New Relic, DataDog
- **Logging**: CloudWatch, LogDNA
- **Uptime**: Pingdom, UptimeRobot

## 🔄 CI/CD Pipeline Overview

### Continuous Integration
1. Code pushed to repository
2. Automated tests run (frontend and backend)
3. Linting and type checking
4. Build verification

### Continuous Deployment
1. Successful CI builds trigger deployment
2. Frontend deployed to CDN
3. Backend deployed to cloud platform
4. Database migrations run (if needed)
5. Health checks verify deployment

### GitHub Actions Example
```yaml
name: Deploy Application

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    # See Frontend Deployment Guide
    
  deploy-backend:
    # See Backend Deployment Guide
```

## 🌍 Multi-Region Deployment

### CDN Configuration (Frontend)
- Use global CDN for static assets
- Configure edge locations near users
- Implement cache invalidation strategy

### API Deployment (Backend)
- Consider multi-region deployment for low latency
- Use load balancers for high availability
- Implement database replication if needed

## 🔧 Troubleshooting Common Issues

### Deployment Failures
1. Check build logs for errors
2. Verify environment variables
3. Test database connectivity
4. Check CORS configuration
5. Verify SSL certificates

### Performance Issues
1. Analyze bundle sizes (frontend)
2. Check API response times
3. Monitor database query performance
4. Review caching strategies

### Connection Issues
1. Verify DNS configuration
2. Check firewall rules
3. Test SSL/TLS configuration
4. Verify API endpoints

## 📈 Scaling Considerations

### Frontend Scaling
- CDN automatically handles scaling
- Consider lazy loading for large applications
- Implement code splitting

### Backend Scaling
- Horizontal scaling with load balancer
- Database connection pooling
- Caching layer (Redis)
- Auto-scaling based on metrics

## 🆘 Emergency Procedures

### Rollback Process
1. Keep previous deployment artifacts
2. Database backup before migrations
3. Quick rollback scripts ready
4. Communication plan for users

### Disaster Recovery
1. Regular automated backups
2. Tested restore procedures
3. Redundant infrastructure
4. Incident response plan

## 📚 Additional Resources

### Platform-Specific Guides
- **Frontend Platforms**: [Netlify](https://docs.netlify.com/), [Vercel](https://vercel.com/docs), [AWS S3](https://docs.aws.amazon.com/s3/)
- **Backend Platforms**: [Docker](https://docs.docker.com/), [AWS](https://aws.amazon.com/), [Google Cloud](https://cloud.google.com/), [DigitalOcean](https://www.digitalocean.com/)
- **Databases**: [MySQL Spatial](https://dev.mysql.com/doc/refman/8.0/en/spatial-types.html)

### Framework Documentation
- **Frontend**: [React](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/), [SQLAlchemy](https://www.sqlalchemy.org/), [Pydantic](https://pydantic-docs.helpmanual.io/)

---

> **For detailed deployment instructions**, please refer to:
> - 🎨 [Frontend Deployment Guide](./frontend/DEPLOYMENT_FRONTEND.md) for React/TypeScript frontend
> - 🖥️ [Backend Deployment Guide](./backend/DEPLOYMENT_BACKEND.md) for Python FastAPI backend
> - 🚀 [Quick Reference](./DEPLOYMENT-QUICK.md) for command cheat sheet