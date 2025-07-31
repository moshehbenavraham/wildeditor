# Paths API Documentation and Region Integration

## Overview

The Paths API manages linear features in the LuminariMUD wilderness system, working alongside the Regions API to create a comprehensive world editing system. While regions define areas with specific properties, paths represent linear features like roads, rivers, and geographic formations.

## Path vs Region Relationship

### **Regions** (Area Features)
- **REGION_GEOGRAPHIC (1)**: Named geographic areas (forests, mountains, etc.)
- **REGION_ENCOUNTER (2)**: Special encounter zones with reset timers
- **REGION_SECTOR_TRANSFORM (3)**: Terrain modification (elevation adjustment)  
- **REGION_SECTOR (4)**: Complete terrain override using sector types

### **Paths** (Linear Features)
- **PATH_ROAD (1)**: Paved roads for high-speed travel
- **PATH_DIRT_ROAD (2)**: Dirt roads for standard travel
- **PATH_GEOGRAPHIC (3)**: Natural linear features (ridges, valleys)
- **PATH_RIVER (5)**: Major waterways
- **PATH_STREAM (6)**: Minor waterways  
- **PATH_CUSTOM_BRIDGE (7)**: Bridge crossings
- **PATH_CUSTOM_TUNNEL (8)**: Underground passages

## How They Work Together

### Geographic Integration
- **Paths can traverse multiple regions**: A road might pass through forest regions, encounter zones, and sector override areas
- **Regions can contain multiple paths**: A mountain region might have both a road and a stream running through it
- **Complementary representation**: Regions define "what's here" while paths define "how to get around"

### Spatial Relationship Examples
```
Mountain Region (REGION_GEOGRAPHIC) + Old Trade Road (PATH_ROAD)
├── Players see: "You are on the Old Trade Road in the Misty Mountains"  
├── Region provides: Area name and general terrain properties
└── Path provides: Movement bonus and visual road representation

River Valley Region (REGION_SECTOR_TRANSFORM) + Swift River (PATH_RIVER)
├── Region: Modifies elevation to create valley terrain
├── Path: Represents the actual river with water movement rules
└── Combined: Creates realistic river valley with proper terrain and water
```

## Technical Implementation

### Database Schema
Both systems use MySQL spatial types for efficient geometric operations:

```sql
-- Regions use POLYGON geometry for areas
CREATE TABLE region_data (
    vnum INT PRIMARY KEY,
    region_polygon GEOMETRY NOT NULL,
    region_type INT NOT NULL,
    ...
);

-- Paths use LINESTRING geometry for linear features  
CREATE TABLE path_data (
    vnum INT PRIMARY KEY,
    path_linestring GEOMETRY NOT NULL,
    path_type INT NOT NULL,
    ...
);
```

### Spatial Queries
The wilderness system can efficiently query both:
```sql
-- Find all regions containing a point
SELECT * FROM region_data 
WHERE ST_Within(GeomFromText('POINT(x y)'), region_polygon);

-- Find all paths passing through a point  
SELECT * FROM path_data
WHERE ST_Within(GeomFromText('POINT(x y)'), path_linestring);
```

## API Endpoints

### Paths API
- `GET /paths/` - List all paths with optional filtering
- `GET /paths/{vnum}` - Get specific path by vnum
- `POST /paths/` - Create new path with coordinate validation
- `PUT /paths/{vnum}` - Update existing path
- `DELETE /paths/{vnum}` - Remove path
- `GET /paths/types` - Get available path types

### Integration Features
- **Coordinate Conversion**: Automatic conversion between coordinate arrays (API) and MySQL geometry (database)
- **Spatial Validation**: Ensures paths have minimum 2 points for valid linestrings
- **Type Validation**: Enforces valid path type constants with descriptive error messages
- **Zone Filtering**: Filter paths by zone_vnum for area-specific editing

## Wilderness System Integration

### Game World Impact
1. **Movement System**: Roads provide movement bonuses, rivers may require swimming
2. **Visual Display**: Paths show as colored lines on wilderness maps
3. **Navigation**: Players can follow roads and rivers for easier travel
4. **Encounters**: Some path types may trigger special encounters or restrictions

### Builder Workflow
1. **Create Region**: Define the area (forest, mountain, etc.)
2. **Add Paths**: Create roads, rivers, or trails through the region
3. **Test Integration**: Verify paths work correctly within region boundaries
4. **Adjust Properties**: Fine-tune path_props for special behaviors

## Real-World Examples

### Trade Route Setup
```json
// 1. Create geographic region
{
  "vnum": 1001,
  "name": "Merchant's Valley", 
  "region_type": 1,  // REGION_GEOGRAPHIC
  "coordinates": [/* valley polygon */]
}

// 2. Add road through the valley
{
  "vnum": 2001,
  "name": "Great Trade Road",
  "path_type": 1,  // PATH_ROAD  
  "coordinates": [/* road linestring */],
  "zone_vnum": 1000
}
```

### River System Setup
```json
// 1. Create sector transform region for valley
{
  "vnum": 1002,
  "region_type": 3,  // REGION_SECTOR_TRANSFORM
  "region_props": -20,  // Lower elevation for valley
  "coordinates": [/* valley polygon */]
}

// 2. Add river through the valley
{
  "vnum": 2002, 
  "name": "Silver River",
  "path_type": 5,  // PATH_RIVER
  "coordinates": [/* river linestring */]
}
```

## API Response Format

### Path Response
```json
{
  "vnum": 2001,
  "zone_vnum": 1000,
  "name": "Great Trade Road",
  "path_type": 1,
  "path_type_name": "Paved Road",
  "coordinates": [
    {"x": 100, "y": 200},
    {"x": 150, "y": 250},
    {"x": 200, "y": 300}
  ],
  "path_props": 0,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

## Best Practices

### Path Design
- **Logical Routing**: Paths should follow realistic routes (roads follow valleys, rivers flow downhill)
- **Appropriate Types**: Use correct path types for the intended purpose
- **Zone Consistency**: Keep related paths in the same zone for easier management
- **Performance**: Avoid excessive detail in coordinate points for better spatial query performance

### Integration with Regions
- **Complementary Coverage**: Use regions for areas and paths for linear features
- **Consistent Naming**: Coordinate naming between related regions and paths
- **Zone Organization**: Group related regions and paths in logical zones
- **Testing**: Always test in-game to ensure proper interaction between regions and paths

## Error Handling

The API provides comprehensive validation:
- **Coordinate Validation**: Ensures minimum 2 points for valid linestrings
- **Type Validation**: Verifies path_type against valid constants
- **Spatial Conversion**: Handles conversion errors gracefully with descriptive messages
- **Database Constraints**: Prevents duplicate vnums and maintains referential integrity

This integrated approach ensures that both regions and paths work together seamlessly to create a rich, navigable wilderness environment for LuminariMUD players!
