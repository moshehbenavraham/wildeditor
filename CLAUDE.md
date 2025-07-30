# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Luminari Wilderness Editor is a full-stack monorepo application for creating and managing wilderness areas in the LuminariMUD game world. It consists of a React/TypeScript frontend and Python FastAPI backend, with shared types and utilities.

**CRITICAL ARCHITECTURE NOTES**:
- ✅ **MIGRATION COMPLETE**: Express backend has been replaced with Python FastAPI
- The backend now directly integrates with LuminariMUD's existing MySQL spatial tables
- Supabase was used for initial development but production uses direct MySQL integration
- Real-time integration with the game world through direct database access

## Common Development Commands

```bash
# Install dependencies
npm install

# Start frontend only (backend runs separately)
npm run dev:frontend  # Frontend on :5173

# Start Python backend
cd apps/backend/src
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Build frontend
npm run build:frontend

# Python backend doesn't need building (interpreted language)

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
- **apps/backend/**: Python 3.8+ + FastAPI + SQLAlchemy + MySQL integration
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
- **Framework**: FastAPI (Python 3.8+) with Uvicorn ASGI server
- **Database**: Direct MySQL integration with LuminariMUD spatial tables
- **ORM**: SQLAlchemy for database operations
- **Validation**: Pydantic schemas for request/response validation
- **API**: RESTful endpoints with automatic OpenAPI documentation
- **Authentication**: JWT token validation (configurable)
- **Performance**: Async support for high-performance operations

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
├── models/                 # SQLAlchemy database models
├── schemas/                # Pydantic request/response schemas
├── routers/                # FastAPI route handlers
├── config/                 # Database and app configuration
├── main.py                 # FastAPI application entry point
└── requirements.txt        # Python dependencies

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
   - Backend: SQLAlchemy ORM with direct MySQL database access
   - Production: Real-time integration with LuminariMUD spatial tables
   - Real-time updates: Optimistic UI updates with API persistence

5. **API Integration**: The frontend communicates with the backend via RESTful API:
   - FastAPI automatic OpenAPI documentation at `/docs`
   - Pydantic validation for all requests and responses
   - CRUD operations for regions, paths, and points
   - Error handling and loading states
   - Optimistic updates for better UX

### Database Schema 

**Production (LuminariMUD MySQL Spatial Tables)**

The backend now directly integrates with LuminariMUD's existing MySQL spatial database:

```sql
-- Regions table (MySQL with spatial support)
CREATE TABLE regions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vnum INT UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  coordinates JSON NOT NULL,
  properties TEXT,
  color VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Paths table  
CREATE TABLE paths (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vnum INT UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  coordinates JSON NOT NULL,
  color VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Points table
CREATE TABLE points (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  coordinate JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Production (LuminariMUD MySQL Spatial Tables)**
The core system will integrate directly with the existing LuminariMUD MySQL spatial database tables. This provides real-time integration with the game world, allowing changes made in the editor to immediately affect the game environment.

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
   - FastAPI server with Python 3.8+
   - SQLAlchemy ORM with MySQL integration
   - Pydantic schemas for validation
   - Async/await support for performance
   - RESTful API with automatic OpenAPI docs
   - Error handling and validation

3. **Shared Development**:
   - Type definitions in packages/shared
   - Both frontend and backend import shared types
   - Consistent data structures across the stack

### Environment Configuration

The monorepo uses environment variables for configuration:

#### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
# Authentication configuration (if needed)
VITE_JWT_SECRET=your_jwt_secret
```

#### Backend (.env)
```
# Database configuration
MYSQL_DATABASE_URL=mysql+pymysql://username:password@localhost/luminari_mudprod

# Server configuration
PORT=8000
HOST=0.0.0.0

# CORS configuration
FRONTEND_URL=http://localhost:5173

# Authentication (optional)
JWT_SECRET=your_jwt_secret
JWT_ALGORITHM=HS256
```

Production domain: `https://wildedit.luminarimud.com`

### Current Implementation Status

**Implemented**:
- ✅ Monorepo structure with npm workspaces
- ✅ **FastAPI backend with Python 3.8+**
- ✅ **Direct MySQL database integration**
- ✅ **SQLAlchemy ORM models**
- ✅ **Pydantic validation schemas**
- ✅ RESTful API endpoints for all entities
- ✅ **Automatic OpenAPI documentation**
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

2. **Set up Python backend environment**:
   ```bash
   # Install Python dependencies
   cd apps/backend/src
   pip install -r requirements.txt
   
   # Configure database connection
   cp .env.example .env
   # Edit .env with your MySQL database credentials
   ```

3. **Set up MySQL database**:
   - Configure connection to LuminariMUD MySQL database
   - Ensure spatial tables exist for regions, paths, points
   - Test database connectivity

4. **Start development servers**:
   ```bash
   # Start frontend
   npm run dev:frontend
   
   # Start Python backend (separate terminal)
   cd apps/backend/src
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000/api
   - API Documentation: http://localhost:8000/docs
   - Health check: http://localhost:8000/api/health

### Common Development Tasks

**Adding new features**:
1. Define types in `packages/shared/src/types/`
2. Add Python models in `apps/backend/src/models/`
3. Create Pydantic schemas in `apps/backend/src/schemas/`
4. Add FastAPI endpoints in `apps/backend/src/routers/`
5. Update frontend API client in `apps/frontend/src/services/api.ts`
6. Test both frontend and backend integration

**Debugging**:
- Frontend: Check browser console and React DevTools
- Backend: Check FastAPI server logs and uvicorn output
- Database: Use MySQL client or GUI tools for query debugging
- API: Use automatic OpenAPI docs at http://localhost:8000/docs
- Authentication: Verify JWT tokens and authentication flow

**Working with the monorepo**:
- Frontend: Use `npm run dev:frontend` 
- Backend: Run Python FastAPI server separately
- Use workspace-specific commands: `npm run dev --workspace=@wildeditor/frontend`
- Shared types are automatically available in frontend
- Changes to shared package require frontend restart

## 📚 Documentation Reference

For comprehensive information beyond this technical overview, refer to:

### Essential Documentation
- **[README.md](README.md)** - Project overview, quick start, and complete documentation map
- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[docs/README_DOCS.md](docs/README_DOCS.md)** - Documentation index and organization guide
- **[docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md)** - Full development guide and best practices
- **[docs/API.md](docs/API.md)** - Complete API reference and examples

### Architecture & Planning
- **[docs/WILDERNESS_PROJECT.md](docs/WILDERNESS_PROJECT.md)** - Detailed project specifications and milestones
- **[docs/WILDERNESS_SYSTEM.md](docs/WILDERNESS_SYSTEM.md)** - LuminariMUD wilderness system architecture
- **[docs/adr/](docs/adr/)** - Architecture Decision Records for major technical decisions

### Migration & Operations
- **[docs/MIGRATION.md](docs/MIGRATION.md)** - Express to Python FastAPI migration guide
- **[docs/INTEGRATION.md](docs/INTEGRATION.md)** - LuminariMUD game server integration procedures
- **[docs/TESTING.md](docs/TESTING.md)** - Testing strategy and implementation guide

### Current Development Status
- **[docs/TODO.md](docs/TODO.md)** - Active development tasks and known issues
- **[docs/CHANGELOG.md](docs/CHANGELOG.md)** - Recent changes and version history
- **[docs/AUDIT.md](docs/AUDIT.md)** - Code quality assessment and recommendations

All documentation is kept up-to-date and reflects the current Python FastAPI backend architecture.