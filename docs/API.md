# API Documentation

This document describes the API endpoints and data structures used by the Luminari Wilderness Editor backend.

## Current Implementation

The backend is implemented using **Python FastAPI** that integrates directly with LuminariMUD's existing MySQL spatial tables. FastAPI provides automatic OpenAPI documentation, high performance async operations, and robust type validation through Pydantic schemas.

The API accurately reflects the LuminariMUD wilderness system behavior, including:
- Complete region type system (1-4) with proper terrain modification behaviors
- Path system (0-5) with spatial LINESTRING geometry and sector overrides  
- All 37 sector types used in the game (0-36)
- Proper coordinate system bounds (-1024 to +1024)
- Game-accurate processing order (regions by type priority, then paths)

## Base URL

```
Development: http://localhost:8000/api
Production: https://api.wildedit.luminarimud.com
```

## Authentication

The API currently operates in development mode without authentication requirements. For production deployment, authentication will be configured using environment variables and can integrate with various auth providers.

Production authentication options:
- JWT tokens
- API keys  
- OAuth integration
- Custom authentication middleware

## Data Types

The API uses Pydantic models for request/response validation with strict game-accurate typing:

### Region Types

- **REGION_GEOGRAPHIC** (1): Geographic naming regions - Provide contextual information for the dynamic description engine without modifying terrain. Used for naming different terrain areas on the base wilderness map, defining geo-political boundaries, and creating landmarks that enhance room descriptions with immersive context
- **REGION_ENCOUNTER** (2): Encounter spawning regions - Controls creature spawning and encounters  
- **REGION_SECTOR_TRANSFORM** (3): Elevation adjustment regions - Modifies sector types for elevation/drainage
- **REGION_SECTOR** (4): Terrain override regions - Completely overrides sector terrain for all included coordinates

Regions are processed in priority order from 1-4, with higher priority regions overriding lower ones.

**Geographic Region Examples:**
- **Area Naming**: "Darkwood Forest", "Iron Hills", "Whispering Plains" - provide names for existing terrain
- **Geo-Political Areas**: "Kingdom of Thay", "Merchant District", "Border Marches" - define political/cultural boundaries
- **Landmarks**: "The North Gate of Ashenport", "Ancient Standing Stones" - single-point regions for notable features

### Path Types

- **PATH_ROAD** (0): Major roads - Maps to sector type 17 (Road)
- **PATH_DIRT_ROAD** (1): Dirt roads - Maps to sector type 18 (Dirt Road)
- **PATH_GEOGRAPHIC** (2): Geographic paths - No sector override, purely descriptive
- **PATH_RIVER** (3): Rivers - Maps to sector type 7 (Water)
- **PATH_STREAM** (4): Streams - Maps to sector type 34 (Stream)
- **PATH_TRAIL** (5): Trails - Maps to sector type 2 (Field)

Paths are processed after regions and can override region terrain assignments.

### Sector Types

The system supports all 37 sector types used in the game (0-36):

**Indoor/Urban Sectors:**
- 0: Inside - Indoor rooms and buildings
- 1: City - Urban streets and developed areas

**Natural Terrain:**
- 2: Field - Open grasslands and meadows
- 3: Forest - Dense woodland areas
- 4: Hills - Rolling hill terrain
- 5: Mountain - Rocky mountain terrain
- 6: Water Swim - Deep water areas requiring swimming
- 7: Water No Swim - Shallow water areas
- 8: Flying - Aerial sectors (clouds, sky)
- 9: Underwater - Submerged underwater areas

**Special Terrain:**
- 10: Shop - Commercial areas and marketplaces
- 11: Important - Key locations and significant areas
- 12: Desert - Arid desert terrain
- 13: Space - Outer space sectors
- 14: Lava - Volcanic and lava terrain
- 15: Ocean - Deep ocean waters
- 16: Swamp - Wetland and marsh areas

**Transportation:**
- 17: Road - Major paved roads
- 18: Dirt Road - Unpaved dirt roads
- 19: Portal - Magical transportation points
- 20: Entrance - Building and area entrances

**Hazardous Terrain:**
- 21: Acid - Corrosive acid areas
- 22: Quicksand - Dangerous quicksand terrain
- 23: Lava - Additional lava terrain type
- 24: Ice - Frozen and icy terrain
- 25: Snow - Snow-covered areas

**Environmental:**
- 26: Air - Open air sectors
- 27: Water - General water terrain
- 28: Jungle - Dense tropical jungle
- 29: Tundra - Cold, barren tundra
- 30: Taiga - Coniferous forest terrain
- 31: Savanna - Tropical grassland
- 32: Badlands - Rocky, barren terrain
- 33: Crater - Impact crater terrain
- 34: Stream - Small flowing water
- 35: Stagnant - Still, stagnant water
- 36: River - Flowing river water

### Coordinate System

All coordinates use the game's spatial system:
- Range: x,y from -1024 to +1024 (inclusive)
- Database storage: MySQL spatial POINT and POLYGON/LINESTRING geometry
- Validation: Strict bounds checking for game compatibility
- Conversion: Automatic conversion between game coordinates and spatial geometry

### Shared Types (from @wildeditor/shared)

```typescript
interface Coordinate {
  x: number; // Range: -1024 to 1024 (game coordinate system)
  y: number; // Range: -1024 to 1024 (game coordinate system)
}

interface Point {
  id: string;
  coordinate: Coordinate;
  name: string;
  type: 'landmark' | 'poi';
}

interface Region {
  id: string;
  vnum: number;           // Region virtual number (1-99999)
  name: string;           // Region display name (max 50 chars)
  type: 1 | 2 | 3 | 4;    // Region type: 1=Geographic, 2=Encounter, 3=Transform, 4=Sector
  coordinates: Coordinate[];  // Polygon boundary coordinates (min 3 points)
  props: string;          // JSON properties for game behavior
  zone_vnum: number;      // Zone virtual number (default: 1)
}

interface Path {
  id: string;
  vnum: number;           // Path virtual number (1-99999)
  name: string;           // Path display name (max 50 chars)
  type: 0 | 1 | 2 | 3 | 4 | 5;  // Path type: 0=Road, 1=Dirt Road, 2=Geographic, 3=River, 4=Stream, 5=Trail
  coordinates: Coordinate[];  // LineString path coordinates (min 2 points)
  props: string;          // JSON properties for game behavior
  zone_vnum: number;      // Zone virtual number (default: 1)
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
Get all regions from the wilderness system.

**Query Parameters:**
- `zone_vnum` (optional): Filter by zone virtual number

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "vnum": 101,
      "name": "Darkwood Forest",
      "type": 1,                      // Geographic naming region
      "coordinates": [
        {"x": 102, "y": 205},
        {"x": 145, "y": 210},
        {"x": 150, "y": 180},
        {"x": 102, "y": 175}
      ],
      "props": "{\"description\": \"Ancient forest region\"}",
      "zone_vnum": 1
    },
    {
      "id": 2,
      "vnum": 102, 
      "name": "Goblin Spawning Grounds",
      "type": 2,                      // Encounter spawning region
      "coordinates": [
        {"x": 200, "y": 300},
        {"x": 250, "y": 350},
        {"x": 280, "y": 320},
        {"x": 230, "y": 270}
      ],
      "props": "{\"spawn_chance\": 0.3, \"creatures\": [\"goblin\", \"orc\"]}",
      "zone_vnum": 1
    }
  ]
}
```

#### GET /regions/{region_id}
Get specific region by ID.

**Response:**
```json
{
  "data": {
    "id": 1,
    "vnum": 101,
    "name": "Darkwood Forest", 
    "type": 1,
    "coordinates": [
      {"x": 102, "y": 205},
      {"x": 145, "y": 210}, 
      {"x": 150, "y": 180},
      {"x": 102, "y": 175}
    ],
    "props": "{\"description\": \"Ancient forest region\"}",
    "zone_vnum": 1
  }
}
```

#### POST /regions
Create new region.

**Request Body:**
```json
{
  "vnum": 103,
  "name": "Mountain Valley",
  "type": 3,                        // Elevation adjustment region
  "coordinates": [
    {"x": 400, "y": 500},
    {"x": 450, "y": 500},
    {"x": 450, "y": 550},
    {"x": 400, "y": 550}
  ],
  "props": "{\"elevation_change\": 200, \"drainage_modifier\": \"good\"}",
  "zone_vnum": 1
}
```

**Validation Rules:**
- `vnum`: 1-99999 (unique region virtual number)
- `name`: 1-50 characters (required)
- `type`: Must be 1, 2, 3, or 4 (1=Geographic, 2=Encounter, 3=Transform, 4=Sector)
- `coordinates`: Minimum 3 points for valid polygon, coordinates within -1024 to +1024 range
- `props`: Valid JSON string for game behavior configuration
- `zone_vnum`: Defaults to 1 if not provided

#### PUT /regions/{region_id}
Update existing region.

**Request Body:** (partial updates supported)
```json
{
  "name": "Updated Mountain Valley",
  "props": "{\"elevation_change\": 300, \"drainage_modifier\": \"excellent\"}"
}
```

#### DELETE /regions/{region_id}
Delete region.

### Paths

#### GET /paths
Get all paths from the wilderness system.

**Query Parameters:**
- `zone_vnum` (optional): Filter by zone virtual number

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "vnum": 201,
      "name": "Old Trade Road",
      "type": 0,                    // Major road - maps to sector 17
      "coordinates": [
        {"x": -100, "y": -100},
        {"x": -50, "y": -50},
        {"x": 0, "y": 0},
        {"x": 50, "y": 50}
      ],
      "props": "{\"width\": \"wide\", \"condition\": \"well_maintained\"}",
      "zone_vnum": 1
    },
    {
      "id": 2, 
      "vnum": 202,
      "name": "Whispering River",
      "type": 3,                    // River - maps to sector 7
      "coordinates": [
        {"x": 300, "y": -200},
        {"x": 350, "y": -150},
        {"x": 400, "y": -100},
        {"x": 450, "y": -50}
      ],
      "props": "{\"depth\": \"deep\", \"current\": \"moderate\"}",
      "zone_vnum": 1
    },
    {
      "id": 3,
      "vnum": 203,
      "name": "Forest Trail",
      "type": 5,                    // Trail - maps to sector 2
      "coordinates": [
        {"x": 150, "y": 200},
        {"x": 175, "y": 225},
        {"x": 200, "y": 250}
      ],
      "props": "{\"difficulty\": \"easy\", \"width\": \"narrow\"}",
      "zone_vnum": 1
    }
  ]
}
```

#### GET /paths/{path_id}
Get specific path by ID.

#### POST /paths
Create new path.

**Request Body:**
```json
{
  "vnum": 204,
  "name": "Forest Stream",
  "type": 4,                        // Stream - maps to sector 34
  "coordinates": [
    {"x": 100, "y": 200},
    {"x": 150, "y": 250},
    {"x": 200, "y": 300}
  ],
  "props": "{\"width\": \"narrow\", \"depth\": \"shallow\"}",
  "zone_vnum": 1
}
```

**Validation Rules:**
- `vnum`: 1-99999 (unique path virtual number)
- `name`: 1-50 characters (required)
- `type`: Must be 0, 1, 2, 3, 4, or 5 (0=Road, 1=Dirt Road, 2=Geographic, 3=River, 4=Stream, 5=Trail)
- `coordinates`: Minimum 2 points for valid linestring, coordinates within -1024 to +1024 range
- `props`: Valid JSON string for game behavior configuration
- `zone_vnum`: Defaults to 1 if not provided

#### PUT /paths/{path_id}
Update existing path.

#### DELETE /paths/{path_id}
Delete path.

### Points

#### GET /points
Get all points/landmarks.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "coordinate": {"x": 75, "y": 85},
      "name": "Ancient Obelisk",
      "type": "landmark"
    }
  ]
}
```

#### GET /points/{point_id}
Get specific point by ID.

#### POST /points
Create new point.

**Request Body:**
```json
{
  "coordinate": {"x": 100, "y": 100},
  "name": "Wizard's Tower",
  "type": "landmark"        // 'landmark' or 'poi'
}
```

**Validation Rules:**
- `coordinate`: Must be within -1024 to +1024 range
- `name`: Required string for point display name
- `type`: Must be either "landmark" or "poi"

#### PUT /points/{point_id}
Update existing point.

#### DELETE /points/{point_id}
Delete point.

## Error Responses

All API endpoints return consistent error responses with detailed information:

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": {
    "field": ["Coordinate x must be between -1024 and 1024"],
    "vnum": ["Region vnum must be between 1 and 99999"]
  }
}
```

### 401 Unauthorized (Production only)
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden (Production only)  
```json
{
  "error": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "error": "Region with ID 'invalid-uuid' not found"
}
```

### 422 Unprocessable Entity
```json
{
  "error": "Invalid region type",
  "details": "Region type must be 1, 2, 3, or 4"
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

### Current Backend (Python FastAPI)
- Located in `apps/backend/`
- Direct integration with LuminariMUD's existing MySQL spatial database
- Uses SQLAlchemy ORM with GeoAlchemy2 for spatial operations
- Environment-based configuration for database credentials
- Automatic OpenAPI documentation at `/docs`
- High-performance async operations with Pydantic validation

### Development Environment
- MySQL database with spatial extensions enabled
- Direct connection to LuminariMUD's `region_data` and `path_data` tables
- Environment variables for secure credential management
- FastAPI development server with hot reloading

## Database Schema

### Production Database (LuminariMUD MySQL)

The FastAPI backend integrates directly with LuminariMUD's existing MySQL spatial database tables:

```sql
-- Region data table (existing LuminariMUD table)
CREATE TABLE region_data (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vnum INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  type TINYINT NOT NULL,              -- 1=Geographic, 2=Encounter, 3=Transform, 4=Sector
  coordinates POLYGON NOT NULL,       -- MySQL spatial polygon
  props TEXT,                         -- JSON properties for game behavior
  zone_vnum INT DEFAULT 1
);

-- Path data table (existing LuminariMUD table)  
CREATE TABLE path_data (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vnum INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  type TINYINT NOT NULL,              -- 0=Road, 1=Dirt Road, 2=Geographic, 3=River, 4=Stream, 5=Trail
  coordinates LINESTRING NOT NULL,    -- MySQL spatial linestring
  props TEXT,                         -- JSON properties for game behavior
  zone_vnum INT DEFAULT 1
);
```

### Spatial Data Handling

The backend automatically converts between:
- Game coordinates: Standard x,y integers (-1024 to +1024)
- MySQL spatial geometry: POINT, POLYGON, and LINESTRING types
- JSON coordinate arrays: For API requests and responses

**Coordinate Conversion Example:**
```python
# Game coordinate to MySQL POINT
game_coord = {"x": 100, "y": 200}
mysql_point = ST_PointFromText(f'POINT({game_coord["x"]} {game_coord["y"]})')

# MySQL POLYGON to coordinate array
mysql_polygon = ST_AsText(coordinates)  # Returns: "POLYGON((x1 y1, x2 y2, ...))"
coord_array = parse_polygon_to_coordinates(mysql_polygon)
```

## Testing the API

### Interactive Documentation

FastAPI provides automatic interactive documentation:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

These interfaces allow you to test all endpoints directly in the browser.

### Using cURL

Health check:
```bash
curl http://localhost:8000/api/health
```

Get all regions:
```bash
curl http://localhost:8000/api/regions
```

Get regions for specific zone:
```bash
curl http://localhost:8000/api/regions?zone_vnum=1
```

Create a new region:
```bash
curl -X POST http://localhost:8000/api/regions \
  -H "Content-Type: application/json" \
  -d '{
    "vnum": 105,
    "name": "Test Region",
    "type": 1,
    "coordinates": [
      {"x": 100, "y": 100},
      {"x": 200, "y": 100},
      {"x": 200, "y": 200},
      {"x": 100, "y": 200}
    ],
    "props": "{\"description\": \"Test region\"}"
  }'
```

### Using the Frontend

The frontend automatically connects to the FastAPI backend and handles all data conversion between the game coordinate system and the API responses.

## Game System Integration

### Region Processing Order

The wilderness system processes regions in a specific order to ensure proper terrain precedence:

1. **Geographic Regions** (type 1): Applied first for contextual information
   - Provide names for existing terrain areas on the base wilderness map
   - Define geo-political boundaries and cultural regions
   - Create landmarks for notable features and points of interest
   - Enhance dynamic description generation without modifying terrain
2. **Encounter Regions** (type 2): Added for creature spawning and encounters  
3. **Transform Regions** (type 3): Applied for elevation and drainage modifications
4. **Sector Regions** (type 4): Final override for complete terrain replacement

### Path Sector Mapping

Paths automatically override terrain sectors based on their type:

| Path Type | Sector Override | Description |
|-----------|----------------|-------------|
| 0 (Road) | 17 (Road) | Major paved roads |
| 1 (Dirt Road) | 18 (Dirt Road) | Unpaved dirt roads |
| 2 (Geographic) | None | Descriptive only |
| 3 (River) | 7 (Water) | Flowing water bodies |
| 4 (Stream) | 34 (Stream) | Small water flows |
| 5 (Trail) | 2 (Field) | Walking paths |

### Coordinate Bounds Validation

All coordinate operations enforce the game's spatial bounds:
- Minimum: x,y = -1024
- Maximum: x,y = +1024
- Validation occurs at both API and database levels
- Out-of-bounds coordinates return 422 validation errors

### JSON Properties Format

Region and path `props` fields store JSON configuration data:

**Region Properties Examples:**
```json
// Geographic region - Area naming
{"description": "Ancient forest of towering oaks", "climate": "temperate", "terrain_name": "Darkwood Forest"}

// Geographic region - Geo-political area
{"political_entity": "Kingdom of Thay", "culture": "magical", "description": "Lands under the rule of the Red Wizards"}

// Geographic landmark (single-point for dynamic description engine)
{"landmark_type": "city_gate", "description": "The ornate northern gate of Ashenport"}

// Encounter region  
{"spawn_chance": 0.25, "creatures": ["wolf", "bear"], "difficulty": "moderate"}

// Transform region
{"elevation_change": 150, "drainage_modifier": "poor", "temperature_adjust": -5}

// Sector region
{"sector_override": 12, "special_flags": ["no_magic", "safe_room"]}
```

**Path Properties Examples:**
```json
// Road path
{"width": "wide", "condition": "excellent", "traffic": "heavy"}

// River path  
{"depth": "deep", "current": "fast", "fordable": false}

// Trail path
{"difficulty": "moderate", "visibility": "hidden", "maintained": true}
```
