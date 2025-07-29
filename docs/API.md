# API Documentation

This document describes the API endpoints and data structures used by the Luminari Wilderness Editor.

## Base URL

```
Development: http://localhost:3000/api
Production: https://wildeditor.luminari.com/api
```

## Authentication

The API uses token-based authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-token>
```

## Data Types

### Coordinates

```typescript
interface WildernessCoordinates {
  x: number; // Range: -1024 to 1024
  y: number; // Range: -1024 to 1024
}
```

### Region

```typescript
interface Region {
  vnum: number;
  zone_vnum: number;
  name: string;
  region_type: RegionType;
  region_props: number;
  coordinates: WildernessCoordinates[];
  created_at: string;
  updated_at: string;
}

enum RegionType {
  GEOGRAPHIC = 1,      // Named geographic areas
  ENCOUNTER = 2,       // Encounter spawn zones
  SECTOR_TRANSFORM = 3, // Terrain modification
  SECTOR = 4           // Complete terrain override
}
```

### Path

```typescript
interface Path {
  vnum: number;
  zone_vnum: number;
  name: string;
  path_type: PathType;
  path_props: number;
  coordinates: WildernessCoordinates[];
  created_at: string;
  updated_at: string;
}

enum PathType {
  ROAD = 1,           // Paved roads
  DIRT_ROAD = 2,      // Dirt roads
  GEOGRAPHIC = 3,     // Geographic features
  RIVER = 5,          // Rivers and streams
  STREAM = 6          // Small streams
}
```

## Endpoints

### Authentication

#### POST /auth/login
Initiate authentication flow.

**Request:**
```json
{
  "provider": "google"
}
```

**Response:**
```json
{
  "auth_url": "https://accounts.google.com/oauth/authorize?..."
}
```

#### GET /auth/callback
OAuth callback endpoint.

**Query Parameters:**
- `code` - Authorization code from OAuth provider
- `state` - State parameter for security

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

#### POST /auth/logout
Logout current user.

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### Map Data

#### GET /map/image
Get the base wilderness map image.

**Query Parameters:**
- `zoom` (optional) - Zoom level (default: 1)
- `format` (optional) - Image format: png, jpg (default: png)

**Response:**
Binary image data with appropriate Content-Type header.

#### GET /map/regions
Get all regions for map display.

**Query Parameters:**
- `zone` (optional) - Filter by zone number
- `type` (optional) - Filter by region type

**Response:**
```json
{
  "regions": [
    {
      "vnum": 100001,
      "zone_vnum": 10000,
      "name": "Darkwood Forest",
      "region_type": 1,
      "region_props": 0,
      "coordinates": [
        {"x": 100, "y": 200},
        {"x": 150, "y": 200},
        {"x": 150, "y": 150},
        {"x": 100, "y": 150}
      ]
    }
  ]
}
```

#### GET /map/paths
Get all paths for map display.

**Query Parameters:**
- `zone` (optional) - Filter by zone number
- `type` (optional) - Filter by path type

**Response:**
```json
{
  "paths": [
    {
      "vnum": 200001,
      "zone_vnum": 10000,
      "name": "King's Road",
      "path_type": 1,
      "path_props": 0,
      "coordinates": [
        {"x": 0, "y": 0},
        {"x": 50, "y": 25},
        {"x": 100, "y": 50}
      ]
    }
  ]
}
```

#### GET /map/at/{x}/{y}
Get all features at specific coordinates.

**Path Parameters:**
- `x` - X coordinate
- `y` - Y coordinate

**Response:**
```json
{
  "coordinates": {"x": 100, "y": 200},
  "regions": [
    {
      "vnum": 100001,
      "name": "Darkwood Forest",
      "region_type": 1
    }
  ],
  "paths": [
    {
      "vnum": 200001,
      "name": "Forest Path",
      "path_type": 2
    }
  ]
}
```

### Region Management

#### GET /regions
List all regions.

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 50)
- `zone` (optional) - Filter by zone
- `type` (optional) - Filter by region type

**Response:**
```json
{
  "regions": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

#### GET /regions/{vnum}
Get specific region by vnum.

**Path Parameters:**
- `vnum` - Region virtual number

**Response:**
```json
{
  "vnum": 100001,
  "zone_vnum": 10000,
  "name": "Darkwood Forest",
  "region_type": 1,
  "region_props": 0,
  "coordinates": [...],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### POST /regions
Create new region.

**Request:**
```json
{
  "zone_vnum": 10000,
  "name": "New Forest",
  "region_type": 1,
  "region_props": 0,
  "coordinates": [
    {"x": 100, "y": 200},
    {"x": 150, "y": 200},
    {"x": 150, "y": 150},
    {"x": 100, "y": 150}
  ]
}
```

**Response:**
```json
{
  "vnum": 100002,
  "message": "Region created successfully"
}
```

#### PUT /regions/{vnum}
Update existing region.

**Path Parameters:**
- `vnum` - Region virtual number

**Request:**
```json
{
  "name": "Updated Forest Name",
  "coordinates": [...]
}
```

**Response:**
```json
{
  "message": "Region updated successfully"
}
```

#### DELETE /regions/{vnum}
Mark region for deletion.

**Path Parameters:**
- `vnum` - Region virtual number

**Response:**
```json
{
  "message": "Region marked for deletion"
}
```

### Path Management

#### GET /paths
List all paths.

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 50)
- `zone` (optional) - Filter by zone
- `type` (optional) - Filter by path type

**Response:**
```json
{
  "paths": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 75,
    "pages": 2
  }
}
```

#### GET /paths/{vnum}
Get specific path by vnum.

#### POST /paths
Create new path.

#### PUT /paths/{vnum}
Update existing path.

#### DELETE /paths/{vnum}
Mark path for deletion.

### Session Management

#### GET /session
Get current editing session.

**Response:**
```json
{
  "session_id": "session-uuid",
  "changes": {
    "regions": {
      "created": [...],
      "updated": [...],
      "deleted": [...]
    },
    "paths": {
      "created": [...],
      "updated": [...],
      "deleted": [...]
    }
  },
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### POST /session/save
Save current session state.

**Request:**
```json
{
  "changes": {
    "regions": {...},
    "paths": {...}
  }
}
```

#### POST /session/commit
Commit session changes to database.

**Request:**
```json
{
  "commit_message": "Added new forest regions and connecting paths"
}
```

**Response:**
```json
{
  "commit_id": "commit-uuid",
  "message": "Changes committed successfully"
}
```

#### POST /session/discard
Discard all session changes.

**Response:**
```json
{
  "message": "Session changes discarded"
}
```

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid coordinates provided",
  "details": {
    "field": "coordinates",
    "issue": "X coordinate out of range (-1024 to 1024)"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Region with vnum 999999 not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

API endpoints are rate limited:
- **Authentication endpoints**: 10 requests per minute
- **Read endpoints**: 100 requests per minute
- **Write endpoints**: 30 requests per minute

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhooks

The API supports webhooks for real-time updates:

### POST /webhooks/register
Register a webhook endpoint.

**Request:**
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["region.created", "region.updated", "path.created"]
}
```

### Webhook Events

- `region.created` - New region created
- `region.updated` - Region modified
- `region.deleted` - Region deleted
- `path.created` - New path created
- `path.updated` - Path modified
- `path.deleted` - Path deleted

## Integration with LuminariMUD

The API integrates directly with the LuminariMUD database:

### Database Tables
- `region_data` - Region definitions
- `region_index` - Spatial index for regions
- `path_data` - Path definitions
- `path_index` - Spatial index for paths

### Coordinate System
- Uses the same coordinate system as the game (-1024 to 1024)
- Coordinates are stored as MySQL GEOMETRY types
- Spatial queries use MySQL's spatial functions

### Real-time Updates
- Changes are immediately available in the game
- No server restart required
- Automatic cache invalidation
