from pydantic import BaseModel, validator
from typing import List, Dict, Optional
from datetime import datetime

# Region type constants
REGION_GEOGRAPHIC = 1      # Named areas
REGION_ENCOUNTER = 2       # Encounter zones  
REGION_SECTOR_TRANSFORM = 3 # Terrain modification (elevation adjustment)
REGION_SECTOR = 4          # Complete terrain override

# Sector type constants for REGION_SECTOR (complete LuminariMUD sector types)
SECTOR_TYPES = {
    0: "Inside", 1: "City", 2: "Field", 3: "Forest", 4: "Hills", 5: "Low Mountains",
    6: "Water (Swim)", 7: "Water (No Swim)", 8: "In Flight", 9: "Underwater", 10: "Zone Entrance",
    11: "Road North-South", 12: "Road East-West", 13: "Road Intersection", 14: "Desert", 15: "Ocean",
    16: "Marshland", 17: "High Mountains", 18: "Outer Planes", 19: "Underdark - Wild", 20: "Underdark - City",
    21: "Underdark - Inside", 22: "Underdark - Water (Swim)", 23: "Underdark - Water (No Swim)", 24: "Underdark - In Flight",
    25: "Lava", 26: "Dirt Road North-South", 27: "Dirt Road East-West", 28: "Dirt Road Intersection", 29: "Cave",
    30: "Jungle", 31: "Tundra", 32: "Taiga", 33: "Beach", 34: "Sea Port", 35: "Inside Room", 36: "River"
}

class RegionBase(BaseModel):
    vnum: int
    zone_vnum: int
    name: str  # Required in API even though nullable in DB
    region_type: int
    coordinates: List[Dict[str, float]]  # Will be converted to/from MySQL POLYGON
    region_props: Optional[int] = None
    region_reset_data: str = ""  # Allow empty string (common in existing data)
    region_reset_time: datetime = datetime(2000, 1, 1)  # Default to valid datetime
    
    @validator('name')
    def validate_name_required(cls, v):
        if not v or not v.strip():
            raise ValueError('Name is required and cannot be empty')
        if len(v) > 50:
            raise ValueError('Name cannot be longer than 50 characters')
        return v.strip()
    
    @validator('region_type')
    def validate_region_type(cls, v):
        if v not in [REGION_GEOGRAPHIC, REGION_ENCOUNTER, REGION_SECTOR_TRANSFORM, REGION_SECTOR]:
            raise ValueError(f'Region type must be one of: {REGION_GEOGRAPHIC} (Geographic), {REGION_ENCOUNTER} (Encounter), {REGION_SECTOR_TRANSFORM} (Sector Transform), {REGION_SECTOR} (Sector Override)')
        return v
    
    @validator('region_props')
    def validate_region_props(cls, v, values):
        if 'region_type' in values:
            region_type = values['region_type']
            
            # REGION_GEOGRAPHIC and REGION_ENCOUNTER: region_props ignored (any value allowed)
            if region_type in [REGION_GEOGRAPHIC, REGION_ENCOUNTER]:
                # Value is ignored by the game - allow any value including 0 or None
                return v
            
            # REGION_SECTOR_TRANSFORM: elevation adjustment value (any integer)
            if region_type == REGION_SECTOR_TRANSFORM:
                # Any integer value allowed (positive or negative elevation adjustment)
                return v
                
            # REGION_SECTOR: must be valid sector type (0-36)
            if region_type == REGION_SECTOR:
                if v is not None and v not in SECTOR_TYPES:
                    valid_sectors = ', '.join(f'{k}: {v}' for k, v in list(SECTOR_TYPES.items())[:10])
                    raise ValueError(f'Invalid sector type for REGION_SECTOR. Valid values (0-36): {valid_sectors}...')
        
        return v
    
    @validator('coordinates')
    def validate_coordinates(cls, v):
        if not v:
            raise ValueError('Coordinates are required')
        
        # Allow single points (will be treated as point regions/landmarks)
        if len(v) == 1:
            coord = v[0]
            if 'x' not in coord or 'y' not in coord:
                raise ValueError('Coordinate must have x and y values')
            return v
        
        # For polygons, need at least 3 points
        if len(v) < 3:
            raise ValueError('Polygons must have at least 3 points, or use 1 point for landmarks')
        
        # Ensure each coordinate has x and y
        for coord in v:
            if 'x' not in coord or 'y' not in coord:
                raise ValueError('Each coordinate must have x and y values')
        
        return v

class RegionCreate(RegionBase):
    pass

class RegionUpdate(BaseModel):
    vnum: Optional[int] = None
    zone_vnum: Optional[int] = None
    name: Optional[str] = None
    region_type: Optional[int] = None
    coordinates: Optional[List[Dict[str, float]]] = None
    region_props: Optional[int] = None
    region_reset_data: Optional[str] = None
    region_reset_time: Optional[datetime] = None
    
    @validator('name')
    def validate_name_if_provided(cls, v):
        if v is not None:
            if not v or not v.strip():
                raise ValueError('Name cannot be empty')
            if len(v) > 50:
                raise ValueError('Name cannot be longer than 50 characters')
            return v.strip()
        return v

class RegionResponse(RegionBase):
    # Add human-readable type and sector descriptions
    region_type_name: Optional[str] = None
    sector_type_name: Optional[str] = None
    
    class Config:
        from_attributes = True

# Helper function to create a landmark/point region (as geographic type)
def create_landmark_region(x: float, y: float, name: str, vnum: int, zone_vnum: int, radius: float = 0.2) -> dict:
    """
    Create a small square polygon around a point coordinate for landmarks/POIs.
    
    Landmarks are single-point geographic regions used by the dynamic description 
    engine to provide contextual references for wilderness room descriptions.
    Examples include city gates, notable buildings, geographical markers, and
    other points of interest that enhance the immersive experience.
    
    These are created as 'geographic' type regions that don't modify terrain
    but provide location context for description generation.
    """
    return {
        "vnum": vnum,
        "zone_vnum": zone_vnum,
        "name": name,
        "region_type": REGION_GEOGRAPHIC,
        "coordinates": [
            {"x": x - radius, "y": y - radius},
            {"x": x - radius, "y": y + radius},
            {"x": x + radius, "y": y + radius},
            {"x": x + radius, "y": y - radius},
            {"x": x - radius, "y": y - radius}  # Close the polygon
        ],
        "region_props": None,  # Not used for geographic regions
        "region_reset_data": "",
        "region_reset_time": datetime.now()
    }

def get_region_type_name(region_type: int) -> str:
    """Get human-readable name for region type"""
    type_names = {
        REGION_GEOGRAPHIC: "Geographic",
        REGION_ENCOUNTER: "Encounter", 
        REGION_SECTOR_TRANSFORM: "Sector Transform",
        REGION_SECTOR: "Sector Override"
    }
    return type_names.get(region_type, f"Unknown ({region_type})")

def get_sector_type_name(sector_id: int) -> str:
    """Get human-readable name for sector type"""
    return SECTOR_TYPES.get(sector_id, f"Unknown ({sector_id})")
