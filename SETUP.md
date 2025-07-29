# Quick Setup Guide

## 1. Configure Environment Variables

You need to update the `.env` files with your actual Supabase credentials:

### Frontend Configuration (`apps/frontend/.env`)
```
VITE_SUPABASE_URL=your_actual_supabase_url
VITE_SUPABASE_ANON_KEY=your_actual_anon_key
```

### Backend Configuration (`apps/backend/.env`)
```
SUPABASE_URL=your_actual_supabase_url
SUPABASE_SERVICE_KEY=your_actual_service_key
```

## 2. Set Up Database

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and run the contents of `database-setup.sql`
4. This will create all necessary tables and enable Row Level Security

## 3. Run the Application

```bash
# Start both frontend and backend
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001/api
- Health check: http://localhost:3001/api/health

## 4. Test the Application

1. Open http://localhost:5173 in your browser
2. The application should load (you may see auth errors until you configure Supabase)
3. Check the browser console for any errors
4. Test the backend health endpoint: http://localhost:3001/api/health

## Next Steps

Once you've added your Supabase credentials:
1. Create a user account through Supabase Auth
2. Sign in to start using the editor
3. Draw regions, paths, and points on the map