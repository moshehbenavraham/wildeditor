from pydantic import BaseModel, validator
from typing import List, Dict, Optional
from datetime import datetime

# Path type constants (based on LuminariMUD wilderness system)
PATH_ROAD = 1           # Paved roads - High-speed travel routes
PATH_DIRT_ROAD = 2      # Dirt roads - Standard travel routes  
PATH_GEOGRAPHIC = 3     # Geographic features - Natural linear formations
PATH_RIVER = 5          # Rivers - Major waterways
PATH_STREAM = 6         # Streams - Minor waterways

# Path types mapping for validation and display
PATH_TYPES = {
    PATH_ROAD: "Paved Road",
    PATH_DIRT_ROAD: "Dirt Road", 
    PATH_GEOGRAPHIC: "Geographic Feature",
    PATH_RIVER: "River",
    PATH_STREAM: "Stream"
}

# Common sector types used with paths (from wilderness context)
PATH_SECTOR_MAPPING = {
    "road_sectors": {
        11: "Road North-South",
        12: "Road East-West", 
        13: "Road Intersection",
        26: "Dirt Road North-South",
        27: "Dirt Road East-West",
        28: "Dirt Road Intersection"
    },
    "water_sectors": {
        6: "Water (Swim)",
        7: "Water (No Swim)",
        36: "River"
    }
}

class PathBase(BaseModel):
    """
    Base path model containing core path properties.
    
    Paths represent linear features in the wilderness that override terrain and provide navigation routes.
    They are stored as LINESTRING geometry in MySQL and processed after regions during terrain generation.
    
    **Path Processing Flow:**
    1. Calculate base terrain using Perlin noise
    2. Apply region effects first (if any)  
    3. Get enclosing paths for coordinate using spatial query
    4. Apply path effects (override with path_props sector type)
    5. Return final sector type with appropriate glyph information
    """
    vnum: int
    zone_vnum: int 
    name: str
    path_type: int
    coordinates: List[Dict[str, float]]  # Will be converted to/from MySQL LINESTRING
    path_props: Optional[int] = 0  # Sector type to apply along the path (0-36)
    
    @validator('name')
    def validate_name_required(cls, v):
        if not v or not v.strip():
            raise ValueError('Path name is required and cannot be empty')
        if len(v) > 50:  # Real DB limit is varchar(50)
            raise ValueError('Path name cannot be longer than 50 characters')
        return v.strip()
    
    @validator('path_type')
    def validate_path_type(cls, v):
        if v not in PATH_TYPES:
            valid_types = ', '.join(f'{k}: {v}' for k, v in PATH_TYPES.items())
            raise ValueError(f'Path type must be one of: {valid_types}')
        return v
    
    @validator('coordinates')
    def validate_coordinates(cls, v):
        if not v or len(v) < 2:
            raise ValueError('Path must have at least 2 coordinate points for valid linestring')
        
        # Ensure each coordinate has x and y
        for i, coord in enumerate(v):
            if 'x' not in coord or 'y' not in coord:
                raise ValueError(f'Coordinate {i} must have x and y values')
            
            # Ensure coordinates are numeric and within wilderness bounds
            try:
                x, y = float(coord['x']), float(coord['y'])
                if not (-1024 <= x <= 1024) or not (-1024 <= y <= 1024):
                    raise ValueError(f'Coordinate {i} ({x}, {y}) outside wilderness bounds (-1024 to +1024)')
            except (ValueError, TypeError):
                raise ValueError(f'Coordinate {i} x and y values must be numeric')
        
        return v
    
    @validator('path_props')
    def validate_path_props(cls, v, values):
        # path_props is the sector type to apply along the path
        # Should be valid sector type (0-36) but allow any value for flexibility
        if v is not None and (v < 0 or v > 36):
            # Warning but don't fail - some custom sector types might exist
            print(f"Warning: path_props {v} outside standard sector range (0-36)")
        return v if v is not None else 0

class PathCreate(PathBase):
    """Schema for creating new paths"""
    pass

class PathUpdate(BaseModel):
    """
    Schema for updating existing paths.
    All fields are optional to support partial updates.
    """
    vnum: Optional[int] = None
    zone_vnum: Optional[int] = None
    name: Optional[str] = None
    path_type: Optional[int] = None
    coordinates: Optional[List[Dict[str, float]]] = None
    path_props: Optional[int] = None
    
    @validator('name')
    def validate_name_if_provided(cls, v):
        if v is not None:
            if not v or not v.strip():
                raise ValueError('Path name cannot be empty')
            if len(v) > 50:  # Real DB limit is varchar(50)
                raise ValueError('Path name cannot be longer than 50 characters')
            return v.strip()
        return v
    
    @validator('path_type')
    def validate_path_type_if_provided(cls, v):
        if v is not None and v not in PATH_TYPES:
            valid_types = ', '.join(f'{k}: {v}' for k, v in PATH_TYPES.items())
            raise ValueError(f'Path type must be one of: {valid_types}')
        return v
    
    @validator('coordinates')
    def validate_coordinates_if_provided(cls, v):
        if v is not None:
            if len(v) < 2:
                raise ValueError('Path must have at least 2 coordinate points')
            
            for i, coord in enumerate(v):
                if 'x' not in coord or 'y' not in coord:
                    raise ValueError(f'Coordinate {i} must have x and y values')
                try:
                    float(coord['x'])
                    float(coord['y'])
                except (ValueError, TypeError):
                    raise ValueError(f'Coordinate {i} x and y values must be numeric')
        return v

class PathResponse(PathBase):
    """
    Response schema for path data with additional computed fields.
    Includes human-readable type names for frontend display.
    
    Note: Real database doesn't have created_at/updated_at fields.
    """
    # Add computed fields for frontend
    path_type_name: Optional[str] = None
    
    class Config:
        from_attributes = True

def get_path_type_name(path_type: int) -> str:
    """Get human-readable name for path type"""
    return PATH_TYPES.get(path_type, f"Unknown ({path_type})")
