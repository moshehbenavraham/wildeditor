# WildEditor API - Game System Integration

## Overview

The WildEditor backend API has been updated to accurately reflect the LuminariMUD wilderness system based on the complete game context. The API now properly represents how regions and paths function in the actual game engine.

## Region System Integration

### Region Types and Behavior

#### **REGION_GEOGRAPHIC (1)** - Named Areas
- **Purpose**: Provides descriptive names to wilderness areas without modifying terrain
- **region_props**: Value ignored by game (any value allowed)
- **Behavior**: No terrain modification, used for atmospheric naming only
- **Examples**: "Whispering Wood", "Iron Hills", "Misty Mountains"
- **API Usage**: Create areas that appear in room descriptions but don't change terrain

#### **REGION_ENCOUNTER (2)** - Special Encounter Zones  
- **Purpose**: Enables encounter spawning with optional reset timers
- **region_props**: Value ignored by game (any value allowed)
- **Behavior**: No terrain modification, manages encounter spawning
- **Reset System**: Uses region_reset_data and region_reset_time for encounter management
- **Examples**: "Dragon Lair Territory", "Bandit Ambush Zone", "Monster Hunting Grounds"
- **API Usage**: Define areas where special encounters can spawn

#### **REGION_SECTOR_TRANSFORM (3)** - Terrain Modification
- **Purpose**: Modifies elevation to change calculated terrain type
- **region_props**: Elevation adjustment value (positive or negative integer)
- **Behavior**: `elevation += region_props; recalculate_sector_type(elevation)`
- **Examples**: Magical uplift (+50), Cursed depression (-30), Earthquake damage (-20)
- **API Usage**: Create areas where elevation is magically or physically altered

#### **REGION_SECTOR (4)** - Complete Terrain Override
- **Purpose**: Completely replaces calculated terrain with specified sector type
- **region_props**: Sector type ID (0-36) from the complete sector types list
- **Behavior**: `sector_type = region_props` (complete override)
- **Examples**: Road through forest (sector 11), Lake in desert (sector 6), City district (sector 1)
- **API Usage**: Force specific terrain types regardless of underlying generation

### Processing Order
- Regions are processed in database order during terrain generation
- Later regions override earlier regions when overlapping
- Multiple regions can affect the same coordinate

## Path System Integration

### Path Types and Behavior

#### **PATH_ROAD (1)** - Paved Roads
- **Purpose**: High-speed travel routes that provide movement bonuses
- **path_props**: Road sector type (typically 11=NS, 12=EW, 13=Intersection)
- **Common Sectors**: 11 (Road North-South), 12 (Road East-West), 13 (Road Intersection)
- **Examples**: "King's Highway", "Trade Route", "Military Road"

#### **PATH_DIRT_ROAD (2)** - Dirt Roads
- **Purpose**: Standard travel routes for rural areas
- **path_props**: Dirt road sector type (typically 26=NS, 27=EW, 28=Intersection)
- **Common Sectors**: 26 (Dirt Road North-South), 27 (Dirt Road East-West), 28 (Dirt Road Intersection)
- **Examples**: "Village Path", "Farm Road", "Logging Trail"

#### **PATH_GEOGRAPHIC (3)** - Geographic Features
- **Purpose**: Natural linear formations in the landscape
- **path_props**: Appropriate terrain sector type for the feature
- **Examples**: "Mountain Ridge", "Valley Floor", "Cliff Edge"

#### **PATH_RIVER (5)** - Rivers
- **Purpose**: Major waterways that affect movement and provide water sources
- **path_props**: Water sector type (typically 6=Swim, 7=Deep Water, 36=River)
- **Common Sectors**: 6 (Water Swim), 7 (Water No Swim), 36 (River)
- **Examples**: "Great River", "Rapids", "Mighty Current"

#### **PATH_STREAM (6)** - Streams
- **Purpose**: Minor waterways and small creeks
- **path_props**: Shallow water sector type (typically 6=Swim, 36=River)
- **Common Sectors**: 6 (Water Swim), 36 (River)
- **Examples**: "Mountain Stream", "Creek", "Brook"

### Processing Order
- Paths are processed AFTER regions during terrain generation
- Paths can override region effects along their linestring route
- Path effects apply the path_props sector type to all coordinates along the path

### Glyph System
- Paths use orientation-based visual glyphs for wilderness map display
- **NS Glyph**: Vertical paths (North-South orientation)
- **EW Glyph**: Horizontal paths (East-West orientation)  
- **Intersection Glyph**: Where multiple paths cross or meet
- Glyph selection is automatic based on path direction analysis

## Complete Sector Types (0-36)

The API now includes all 37 sector types used in LuminariMUD:

```
0: Inside, 1: City, 2: Field, 3: Forest, 4: Hills, 5: Low Mountains,
6: Water (Swim), 7: Water (No Swim), 8: In Flight, 9: Underwater, 10: Zone Entrance,
11: Road North-South, 12: Road East-West, 13: Road Intersection, 14: Desert, 15: Ocean,
16: Marshland, 17: High Mountains, 18: Outer Planes, 19: Underdark - Wild, 20: Underdark - City,
21: Underdark - Inside, 22: Underdark - Water (Swim), 23: Underdark - Water (No Swim), 24: Underdark - In Flight,
25: Lava, 26: Dirt Road North-South, 27: Dirt Road East-West, 28: Dirt Road Intersection, 29: Cave,
30: Jungle, 31: Tundra, 32: Taiga, 33: Beach, 34: Sea Port, 35: Inside Room, 36: River
```

## Coordinate System

- **Range**: X and Y coordinates from -1024 to +1024
- **Origin**: (0,0) at map center
- **Directions**: North=+Y, South=-Y, East=+X, West=-X
- **Storage**: MySQL spatial types (POLYGON for regions, LINESTRING for paths)

## API Endpoints Updated

### Regions API
- `GET /regions/` - Enhanced documentation explaining region behavior
- `GET /regions/types` - Complete game system information
- `POST /regions/` - Detailed documentation for each region type
- All endpoints now accurately reflect how each region type affects terrain

### Paths API  
- `GET /paths/` - Enhanced documentation explaining path processing
- `GET /paths/types` - Complete path system information including sector mappings
- `POST /paths/` - Detailed documentation for each path type with sector examples
- All endpoints now accurately reflect path behavior and glyph system

## Validation Updates

### Region Validation
- **region_props for GEOGRAPHIC/ENCOUNTER**: Any value allowed (ignored by game)
- **region_props for SECTOR_TRANSFORM**: Any integer (elevation adjustment)
- **region_props for SECTOR**: Must be valid sector type (0-36)

### Path Validation
- **Coordinates**: Must be within wilderness bounds (-1024 to +1024)
- **path_props**: Should be valid sector type (0-36) but flexible for custom types
- **Linestring**: Minimum 2 points required for valid geometry

## Game Integration Features

### Terrain Generation Flow
1. Calculate base terrain using Perlin noise (elevation, moisture, temperature)
2. Apply region effects in database order (later regions override earlier)
3. Apply path effects along linestring routes (paths override regions)
4. Select appropriate glyphs based on path orientations
5. Return final sector type and visual information

### Spatial Query Optimization
- Regions use polygon containment queries (`ST_Within`)
- Paths use linestring intersection queries (`ST_Intersects`)
- Separate index tables for performance optimization
- Efficient spatial indexing for real-time terrain generation

### Builder Integration
- Compatible with existing builder commands (`reglist`, `pathlist`)
- Supports procedural river generation system
- Integrates with encounter reset system
- Provides complete wilderness editing capabilities

## Real-World Usage Examples

### Creating a Forest Road
```json
// 1. Create forest region (naming)
{
  "vnum": 1001,
  "name": "Whispering Wood",
  "region_type": 1,  // REGION_GEOGRAPHIC
  "region_props": 0, // Ignored
  "coordinates": [/* forest polygon */]
}

// 2. Create road through forest (terrain override)
{
  "vnum": 2001,
  "name": "Forest Highway",
  "path_type": 1,    // PATH_ROAD
  "path_props": 12,  // Road East-West sector
  "coordinates": [/* road linestring */]
}
```

### Creating a Magical Valley with River
```json
// 1. Create elevation depression
{
  "vnum": 1002,
  "region_type": 3,   // REGION_SECTOR_TRANSFORM
  "region_props": -50, // Lower elevation by 50
  "coordinates": [/* valley polygon */]
}

// 2. Add river through valley
{
  "vnum": 2002,
  "name": "Silver River", 
  "path_type": 5,    // PATH_RIVER
  "path_props": 36,  // River sector
  "coordinates": [/* river linestring */]
}
```

This updated API now accurately represents the LuminariMUD wilderness system and provides builders with the tools they need to create complex, interactive wilderness environments!
