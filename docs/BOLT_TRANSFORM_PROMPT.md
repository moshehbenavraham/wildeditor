# Bolt.new Prompt to Transform Existing Project to Monorepo

## Context
This project already has a React frontend with authentication, drawing tools, and basic functionality. We need to restructure it into a monorepo and add a Node.js backend.

## The Transformation Prompt

```
Transform this existing wilderness editor project into a monorepo structure with a Node.js Express backend:

## Current State:
- React 18 TypeScript frontend with Vite
- Supabase authentication already implemented
- Drawing tools working (select, point, polygon, linestring)
- Canvas-based map editor with -1024 to +1024 coordinates
- Mock data in useEditor hook

## Required Transformation:

1. **Restructure to Monorepo**:
   Create this structure while preserving all existing code:
   ```
   wildeditor/
   ├── apps/
   │   ├── frontend/          # Move all current src/ here
   │   │   ├── src/
   │   │   ├── public/
   │   │   ├── index.html
   │   │   ├── package.json
   │   │   ├── vite.config.ts
   │   │   └── tsconfig.json
   │   └── backend/           # New Express API
   │       ├── src/
   │       │   ├── routes/
   │       │   ├── controllers/
   │       │   ├── models/
   │       │   ├── middleware/
   │       │   ├── config/
   │       │   └── index.ts
   │       ├── package.json
   │       └── tsconfig.json
   ├── packages/
   │   └── shared/            # Shared types
   │       ├── src/
   │       │   └── types/
   │       ├── package.json
   │       └── tsconfig.json
   ├── docs/                  # Keep existing docs
   ├── package.json          # Workspace root
   ├── turbo.json           # Turborepo config
   └── .env.example         # Update with backend vars
   ```

2. **Move Files** (preserve git history):
   - Move src/, public/, index.html to apps/frontend/
   - Move vite.config.ts, tsconfig.json, postcss.config.js, tailwind.config.js to apps/frontend/
   - Extract types from frontend/src/types to packages/shared/src/types
   - Keep docs/ at root level

3. **Create Express Backend** in apps/backend/:
   - TypeScript Express server
   - Port 3001 (frontend stays on 5173)
   - CORS configured for frontend URL
   - Supabase client for database operations
   - RESTful API matching the existing mock data structure

4. **API Routes to Implement**:
   ```typescript
   // Region endpoints
   GET    /api/regions
   GET    /api/regions/:id
   POST   /api/regions
   PUT    /api/regions/:id
   DELETE /api/regions/:id

   // Path endpoints  
   GET    /api/paths
   GET    /api/paths/:id
   POST   /api/paths
   PUT    /api/paths/:id
   DELETE /api/paths/:id

   // Point endpoints
   GET    /api/points
   GET    /api/points/:id
   POST   /api/points
   PUT    /api/points/:id
   DELETE /api/points/:id

   // Session endpoints
   GET    /api/session
   POST   /api/session/save
   POST   /api/session/commit
   ```

5. **Update Frontend**:
   - Create api service layer in frontend/src/services/api.ts
   - Replace mock data in useEditor with API calls
   - Add loading states and error handling
   - Keep all existing functionality intact

6. **Shared Package**:
   - Move existing types/index.ts interfaces to shared
   - Both frontend and backend import from @wildeditor/shared

7. **Root package.json Scripts**:
   ```json
   {
     "scripts": {
       "dev": "turbo run dev",
       "build": "turbo run build",
       "lint": "turbo run lint",
       "type-check": "turbo run type-check"
     }
   }
   ```

8. **Environment Variables**:
   Update .env.example to include:
   ```
   # Frontend (existing)
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   
   # Backend (new)
   PORT=3001
   SUPABASE_URL=
   SUPABASE_SERVICE_KEY=
   FRONTEND_URL=http://localhost:5173
   ```

9. **Preserve Existing Features**:
   - Keep all components exactly as they are
   - Maintain keyboard shortcuts
   - Keep authentication flow
   - Preserve drawing tool functionality
   - Just add API integration layer

10. **Database Schema** (Supabase):
    Create these tables using Supabase dashboard or migrations:
    ```sql
    -- Enable PostGIS
    create extension if not exists postgis;

    -- Regions table
    create table regions (
      id uuid primary key default gen_random_uuid(),
      vnum integer unique not null,
      name text not null,
      type text not null,
      coordinates jsonb not null,
      properties text,
      color text,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    -- Paths table  
    create table paths (
      id uuid primary key default gen_random_uuid(),
      vnum integer unique not null,
      name text not null,
      type text not null,
      coordinates jsonb not null,
      color text,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    -- Points table
    create table points (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      type text not null,
      coordinate jsonb not null,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
    ```

IMPORTANT: 
- Do NOT delete or modify existing frontend code functionality
- Preserve all git history by using proper move commands
- Test that all existing features still work after restructure
- Add proper error handling for API failures
- Keep frontend running on same port (5173)
```

## Follow-up Prompts After Transformation

1. **Connect Frontend to Backend**:
   ```
   Update the useEditor hook to use the new API service instead of mock data. Add proper loading states, error handling, and optimistic updates. Make sure all existing functionality remains intact.
   ```

2. **Add Middleware**:
   ```
   Add authentication middleware to the Express backend that validates Supabase JWT tokens. Protect all API routes except health check.
   ```

3. **Optimize Performance**:
   ```
   Add caching layer to the backend API. Implement pagination for large datasets. Add database indexes for common queries.
   ```

4. **Add WebSocket Support**:
   ```
   Add Socket.IO to enable real-time collaboration. Show other users' cursors and selections. Sync changes across multiple clients.
   ```

## Why This Approach?

- **Minimal Disruption**: Preserves all existing code and functionality
- **Gradual Migration**: Can switch from mock to API one endpoint at a time
- **Type Safety**: Shared types package ensures frontend/backend compatibility
- **Future-Proof**: Easy to later replace Express with Python FastAPI
- **Development Experience**: Turborepo provides fast builds and hot reload

## Python Backend Migration Path

**This Node.js backend is temporary!** Here's the plan:

1. **Phase 1** (Bolt.new): Create Node.js Express API that matches our intended Python API structure
2. **Phase 2** (Manual): Develop Python FastAPI backend locally with identical endpoints
3. **Phase 3** (Switch): Replace Express with Python - frontend won't know the difference!

### Future Python Structure:
```
wildeditor/
├── apps/
│   ├── frontend/        # React (unchanged)
│   ├── backend/         # Python FastAPI (replaces Express)
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── routes/
│   │   │   │   └── endpoints/
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   └── main.py
│   │   ├── requirements.txt
│   │   └── pyproject.toml
│   └── backend-node/    # Keep for reference during migration
```

### Why This Works:
- Same API contract (RESTful endpoints)
- Same database (Supabase PostgreSQL)
- Same authentication (Supabase JWT)
- Frontend remains completely unchanged
- Can develop Python backend while using Node.js

### Python Backend Preview:
```python
# FastAPI equivalent of Express routes
from fastapi import FastAPI, HTTPException
from sqlalchemy import create_engine
from geoalchemy2 import Geometry

@app.get("/api/regions")
async def get_regions():
    # Identical response to Express version
    return regions

@app.post("/api/regions")
async def create_region(region: RegionSchema):
    # Same validation and response
    return new_region
```

The Express backend is just scaffolding to get us running quickly in Bolt.new!

## Testing the Transformation

After Bolt.new completes the transformation, verify:
1. Frontend still runs on http://localhost:5173
2. Backend runs on http://localhost:3001
3. All drawing tools still work
4. Authentication still functions
5. API endpoints return data matching mock structure