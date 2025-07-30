# Quick Deployment Reference

For complete deployment instructions, see **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**

## Frontend → Netlify
```bash
# Build command
npm run build

# Environment variables (from .env.production.example)
VITE_API_URL=https://your-backend-domain.com/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Backend → Coolify  
```bash
# Build pack: docker-compose
# Compose file: docker-compose.prod.yml

# Environment variables
FRONTEND_URL=https://your-frontend-domain.com
SUPABASE_URL=your_supabase_url  
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

## Files Created for Deployment
- `docker-compose.yml` / `docker-compose.prod.yml` - Coolify deployment
- `Dockerfile` - Multi-stage production build
- `.coolify.yml` - Coolify configuration hints
- `.env.production.example` - Environment template

**📖 Full Guide**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)