# API Documentation

This document describes the API endpoints and data structures used by the Luminari Wilderness Editor backend.

## Current Implementation

The backend is implemented using **Python FastAPI** that integrates directly with LuminariMUD's existing MySQL spatial tables. FastAPI provides automatic OpenAPI documentation, high performance async operations, and robust type validation through Pydantic schemas.

## Base URL

```
Development: http://localhost:8000/api
Production: https://api.wildedit.luminarimud.com
```

## Authentication

The API uses Supabase JWT authentication. Include the access token in the Authorization header:

```http
Authorization: Bearer <your-supabase-access-token>
```

The FastAPI authentication middleware validates tokens with Supabase before allowing access to protected endpoints. Authentication is configurable and can be adapted for production deployment.

## Data Types

### Shared Types (from @wildeditor/shared)

```typescript
interface Coordinate {
  x: number; // Range: -1024 to 1024
  y: number; // Range: -1024 to 1024
}

interface Point {
  id: string;
  coordinate: Coordinate;
  name: string;
  type: 'landmark' | 'poi';
}

interface Region {
  id: string;
  vnum: number;
  name: string;
  type: 'geographic' | 'encounter' | 'sector_transform' | 'sector';
  coordinates: Coordinate[];
  properties: string;
  color: string;
}

interface Path {
  id: string;
  vnum: number;
  name: string;
  type: 'road' | 'dirt_road' | 'geographic' | 'river' | 'stream';
  coordinates: Coordinate[];
  color: string;
}
```

### API Response Types

```typescript
interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}
```

## Endpoints

### Health Check

#### GET /health
Check API server status (no authentication required).

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-30T12:00:00.000Z",
  "service": "wildeditor-backend"
}
```

### Regions

#### GET /regions
Get all regions (authentication required).

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "vnum": 101,
      "name": "Darkwood Forest",
      "type": "geographic",
      "coordinates": [
        {"x": 102, "y": 205},
        {"x": 145, "y": 210},
        {"x": 150, "y": 180},
        {"x": 102, "y": 175}
      ],
      "properties": "Forest terrain",
      "color": "#22C55E"
    }
  ]
}
```

#### GET /regions/:id
Get specific region by ID (authentication required).

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "vnum": 101,
    "name": "Darkwood Forest",
    "type": "geographic",
    "coordinates": [...],
    "properties": "Forest terrain",
    "color": "#22C55E"
  }
}
```

#### POST /regions
Create new region (authentication required).

**Request Body:**
```json
{
  "vnum": 103,
  "name": "New Region",
  "type": "geographic",
  "coordinates": [
    {"x": 0, "y": 0},
    {"x": 50, "y": 0},
    {"x": 50, "y": 50},
    {"x": 0, "y": 50}
  ],
  "properties": "Description",
  "color": "#FF0000"
}
```

#### PUT /regions/:id
Update existing region (authentication required).

**Request Body:** (partial updates supported)
```json
{
  "name": "Updated Name",
  "coordinates": [...]
}
```

#### DELETE /regions/:id
Delete region (authentication required).

### Paths

#### GET /paths
Get all paths (authentication required).

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "vnum": 201,
      "name": "Old Trade Road",
      "type": "road",
      "coordinates": [
        {"x": -100, "y": -100},
        {"x": -50, "y": -50},
        {"x": 0, "y": 0}
      ],
      "color": "#8B5CF6"
    }
  ]
}
```

#### GET /paths/:id
Get specific path by ID (authentication required).

#### POST /paths
Create new path (authentication required).

**Request Body:**
```json
{
  "vnum": 203,
  "name": "New Path",
  "type": "dirt_road",
  "coordinates": [
    {"x": 0, "y": 0},
    {"x": 50, "y": 50}
  ],
  "color": "#8B5CF6"
}
```

#### PUT /paths/:id
Update existing path (authentication required).

#### DELETE /paths/:id
Delete path (authentication required).

### Points

#### GET /points
Get all points/landmarks (authentication required).

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "coordinate": {"x": 75, "y": 85},
      "name": "Ancient Obelisk",
      "type": "landmark"
    }
  ]
}
```

#### GET /points/:id
Get specific point by ID (authentication required).

#### POST /points
Create new point (authentication required).

**Request Body:**
```json
{
  "coordinate": {"x": 100, "y": 100},
  "name": "New Landmark",
  "type": "poi"
}
```

#### PUT /points/:id
Update existing point (authentication required).

#### DELETE /points/:id
Delete point (authentication required).

## Error Responses

All API endpoints return consistent error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## CORS Configuration

The API allows cross-origin requests from configured frontend URLs:
- Development: `http://localhost:5173`
- Production: `https://wildedit.luminarimud.com`

## Implementation Notes

### Current Backend (Express/TypeScript) - TEMPORARY
- Located in `apps/backend/`
- Uses Supabase for local development and temporary changes
- JWT validation via Supabase auth middleware
- All endpoints return `ApiResponse<T>` wrapper

### Future Backend (Python FastAPI) - PRODUCTION
- Will maintain identical API structure
- Same endpoints and response formats
- Drop-in replacement for Express backend
- **Direct integration with LuminariMUD's existing MySQL spatial tables**
- Enhanced spatial operations with GeoAlchemy2

## Database Schema

### Development Schema (Supabase PostgreSQL)

The current Express backend uses Supabase PostgreSQL for development with the following tables:

```sql
-- Enable PostGIS for spatial operations
CREATE EXTENSION IF NOT EXISTS postgis;

-- Regions table
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vnum INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  properties TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paths table  
CREATE TABLE paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vnum INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Points table
CREATE TABLE points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  coordinate JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Production Schema (LuminariMUD MySQL)

The Python FastAPI backend will integrate directly with LuminariMUD's existing MySQL spatial database tables, providing real-time integration with the game world.

```sql
-- Production tables are part of LuminariMUD's existing MySQL schema
-- Direct integration allows immediate game world updates
```

## Testing the API

### Using cURL

Health check:
```bash
curl http://localhost:3001/api/health
```

Get regions (with auth):
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/regions
```

### Using the Frontend

The frontend automatically includes the auth token in all API requests via the `apiClient` service in `apps/frontend/src/services/api.ts`.
