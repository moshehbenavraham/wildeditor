# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Luminari Wilderness Editor is a full-stack monorepo application for creating and managing wilderness areas in the LuminariMUD game world. It consists of a React/TypeScript frontend and Express/TypeScript backend, with shared types and utilities.

## Common Development Commands

```bash
# Install dependencies
npm install

# Start both frontend and backend
npm run dev

# Start individual services
npm run dev:frontend  # Frontend on :5173
npm run dev:backend   # Backend on :3001

# Build all packages
npm run build

# Build individual packages
npm run build:frontend
npm run build:backend

# Run linting across all packages
npm run lint

# Fix linting issues across all packages
npm run lint:fix

# Type checking across all packages
npm run type-check

# Clean all build artifacts
npm run clean
```

## Architecture Overview

### Monorepo Structure
This is a monorepo using npm workspaces and Turborepo for build orchestration:

- **apps/frontend/**: React 18.3 + TypeScript 5.5 + Vite
- **apps/backend/**: Express + TypeScript + Supabase integration
- **packages/shared/**: Shared TypeScript types and utilities

### Technology Stack

#### Frontend (`apps/frontend/`)
- **Framework**: React 18.3 with TypeScript 5.5
- **Build Tool**: Vite 7.0
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: Supabase Auth (client-side)
- **API Client**: Custom fetch-based client with error handling

#### Backend (`apps/backend/`)
- **Framework**: Express.js with TypeScript
- **Database**: Supabase (PostgreSQL with PostGIS)
- **Authentication**: Supabase JWT verification
- **API**: RESTful endpoints with proper error handling
- **Security**: Helmet, CORS, request validation

#### Shared (`packages/shared/`)
- **Types**: Shared TypeScript interfaces and types
- **Utilities**: Common functions used by both frontend and backend

### Core Application Structure

The application follows a clean separation between frontend and backend:

```
apps/frontend/src/
├── components/             # React UI components
├── hooks/                  # Custom React hooks
├── services/               # API client and external services
├── types/                  # Type definitions (re-exports from shared)
└── App.tsx                 # Main application component

apps/backend/src/
├── controllers/            # Request handlers
├── models/                 # Database models
├── routes/                 # API route definitions
├── middleware/             # Express middleware
├── config/                 # Configuration files
└── index.ts                # Express server entry point

packages/shared/src/
└── types/                  # Shared TypeScript interfaces
```

### Key Concepts

1. **Coordinate System**: The wilderness uses a coordinate grid from -1024 to +1024 on both X and Y axes, matching the LuminariMUD wilderness system.

2. **Drawing Tools**:
   - `select`: Click items to view/edit properties
   - `point`: Place single landmarks
   - `polygon`: Draw regions (requires 3+ points)
   - `linestring`: Draw paths (requires 2+ points)

3. **Data Types**:
   - **Region**: Polygonal areas with types (geographic, encounter, sector_transform, sector)
   - **Path**: Linear features with types (road, dirt_road, geographic, river, stream)
   - **Point**: Single coordinate landmarks

4. **State Management**: 
   - Frontend: React hooks with API integration
   - Backend: Supabase database with Express controllers
   - Real-time updates: Optimistic UI updates with API persistence

5. **API Integration**: The frontend communicates with the backend via RESTful API:
   - Authentication via Supabase JWT tokens
   - CRUD operations for regions, paths, and points
   - Error handling and loading states
   - Optimistic updates for better UX

### Database Schema (Supabase)

```sql
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

### API Endpoints

The backend provides RESTful endpoints:

```
GET    /api/health           # Health check
GET    /api/regions          # List all regions
GET    /api/regions/:id      # Get specific region
POST   /api/regions          # Create region (auth required)
PUT    /api/regions/:id      # Update region (auth required)
DELETE /api/regions/:id      # Delete region (auth required)

# Similar endpoints for /api/paths and /api/points
```

### Authentication Flow

1. User authenticates with Supabase (frontend)
2. Frontend receives JWT access token
3. API client sets Authorization header for backend requests
4. Backend middleware validates JWT with Supabase
5. Protected routes require valid authentication

### Development Workflow

1. **Frontend Development**: 
   - Current tool selection
   - Drawing state and temporary coordinates
   - Selected items for editing
   - Layer visibility toggles
   - Zoom level and mouse position
   - API integration with loading/error states

2. **Backend Development**:
   - Express server with TypeScript
   - Supabase database integration
   - JWT authentication middleware
   - RESTful API design
   - Error handling and validation

3. **Shared Development**:
   - Type definitions in packages/shared
   - Both frontend and backend import shared types
   - Consistent data structures across the stack

### Environment Configuration

The monorepo uses environment variables for configuration:

#### Frontend (.env)
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3001/api
```

#### Backend (.env)
```
PORT=3001
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
FRONTEND_URL=http://localhost:5173
```

Production domain: `https://wildedit.luminarimud.com`

### Current Implementation Status

**Implemented**:
- ✅ Monorepo structure with npm workspaces
- ✅ Express backend with TypeScript
- ✅ Supabase database integration
- ✅ JWT authentication middleware
- ✅ RESTful API endpoints for all entities
- ✅ Frontend API client with error handling
- ✅ Optimistic UI updates
- ✅ Shared type definitions
- ✅ Development workflow with Turborepo

**In Progress**:
- Database table creation (manual setup required)
- Error boundary implementation
- Comprehensive testing
- Production deployment configuration

### Getting Started (Development)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Create database tables**:
   - Open your Supabase dashboard
   - Run the SQL commands from the Database Schema section
   - Enable PostGIS extension if needed

4. **Start development servers**:
   ```bash
   npm run dev  # Starts both frontend and backend
   ```

5. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api
   - Health check: http://localhost:3001/api/health

### Common Development Tasks

**Adding new features**:
1. Define types in `packages/shared/src/types/`
2. Add backend endpoints in `apps/backend/src/routes/`
3. Create frontend components in `apps/frontend/src/components/`
4. Update API client in `apps/frontend/src/services/api.ts`
5. Test both frontend and backend integration

**Debugging**:
- Frontend: Check browser console and React DevTools
- Backend: Check server logs and API responses
- Database: Use Supabase dashboard for query debugging
- Authentication: Verify JWT tokens and Supabase configuration

**Working with the monorepo**:
- Use `npm run dev` to start everything
- Use workspace-specific commands: `npm run dev --workspace=@wildeditor/frontend`
- Shared types are automatically available in both frontend and backend
- Changes to shared package require restart of dependent services