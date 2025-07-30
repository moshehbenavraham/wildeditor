from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from datetime import datetime
from ..models.path import Path
from ..schemas.path import (
    PathCreate, PathResponse, PathUpdate, get_path_type_name,
    PATH_TYPES, PATH_ROAD, PATH_DIRT_ROAD, PATH_GEOGRAPHIC, PATH_RIVER, PATH_STREAM,
    PATH_SECTOR_MAPPING
)
from ..config.config_database import get_db

router = APIRouter()

def coordinates_to_linestring_wkt(coordinates: List[dict]) -> str:
    """
    Convert coordinate list to MySQL LINESTRING WKT format.
    
    Args:
        coordinates: List of coordinate dictionaries with 'x' and 'y' keys
        
    Returns:
        WKT string in format: LINESTRING(x1 y1, x2 y2, ...)
    """
    if not coordinates or len(coordinates) < 2:
        raise ValueError("Path must have at least 2 coordinate points")
    
    points = [f"{coord['x']} {coord['y']}" for coord in coordinates]
    return f"LINESTRING({', '.join(points)})"

def linestring_wkt_to_coordinates(wkt: str) -> List[dict]:
    """
    Convert MySQL LINESTRING WKT format to coordinate list.
    
    Args:
        wkt: WKT string in format LINESTRING(x1 y1, x2 y2, ...)
        
    Returns:
        List of coordinate dictionaries with 'x' and 'y' keys
    """
    if not wkt:
        return []
    
    try:
        # Remove LINESTRING( and )
        coords_str = wkt.replace("LINESTRING(", "").replace(")", "")
        point_pairs = coords_str.split(", ")
        
        coordinates = []
        for pair in point_pairs:
            if pair.strip():
                parts = pair.strip().split()
                if len(parts) >= 2:
                    x, y = float(parts[0]), float(parts[1])
                    coordinates.append({"x": x, "y": y})
        
        return coordinates
    except Exception as e:
        print(f"Error parsing LINESTRING WKT: {e}, WKT: {wkt}")
        return []

@router.get("/", response_model=List[PathResponse])
def get_paths(
    path_type: Optional[int] = Query(None, description="Filter by path type (1=Road, 2=Dirt Road, 3=Geographic, 5=River, 6=Stream)"),
    zone_vnum: Optional[int] = Query(None, description="Filter by zone vnum"),
    db: Session = Depends(get_db)
):
    """
    Get all paths, optionally filtered by type or zone.
    
    Paths are linear features that override terrain and provide navigation routes:
    
    - **PATH_ROAD (1)**: Paved roads - High-speed travel routes, typically use road sectors (11,12,13)
    - **PATH_DIRT_ROAD (2)**: Dirt roads - Standard travel routes, typically use dirt road sectors (26,27,28)
    - **PATH_GEOGRAPHIC (3)**: Geographic features - Natural linear formations like ridges or valleys
    - **PATH_RIVER (5)**: Rivers - Major waterways, typically use water sectors (6,7,36)
    - **PATH_STREAM (6)**: Streams - Minor waterways, typically use shallow water sectors (6,36)
    
    **Processing Order**: Paths are processed AFTER regions during terrain generation and can override region effects.
    Each path applies its path_props sector type along the linestring route, replacing the underlying terrain.
    
    **Visual System**: Paths use orientation-based glyphs (NS, EW, Intersection) for wilderness map display.
    """
    try:
        query = db.query(Path)
        if path_type:
            query = query.filter(Path.path_type == path_type)
        if zone_vnum:
            query = query.filter(Path.zone_vnum == zone_vnum)
        
        paths = query.all()
        
        # Convert to response format
        response_paths = []
        for path in paths:
            # Convert MySQL LINESTRING to coordinates
            coordinates = []
            if path.path_linestring:
                # Use ST_AsText to get WKT format
                result = db.execute(text("SELECT ST_AsText(:linestring)"), {"linestring": path.path_linestring}).fetchone()
                if result:
                    coordinates = linestring_wkt_to_coordinates(result[0])
            
            path_dict = {
                "vnum": path.vnum,
                "zone_vnum": path.zone_vnum,
                "name": path.name,
                "path_type": path.path_type,
                "coordinates": coordinates,
                "path_props": path.path_props,
                "path_type_name": get_path_type_name(path.path_type)
            }
            response_paths.append(PathResponse(**path_dict))
        
        return response_paths
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving paths: {str(e)}"
        )

@router.get("/{vnum}", response_model=PathResponse)
def get_path(vnum: int, db: Session = Depends(get_db)):
    """
    Get a specific path by vnum.
    
    Args:
        vnum: Unique path identifier (primary key)
    """
    path = db.query(Path).filter(Path.vnum == vnum).first()
    if not path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Path with vnum {vnum} not found"
        )
    
    # Convert MySQL LINESTRING to coordinates
    coordinates = []
    if path.path_linestring:
        result = db.execute(text("SELECT ST_AsText(:linestring)"), {"linestring": path.path_linestring}).fetchone()
        if result:
            coordinates = linestring_wkt_to_coordinates(result[0])
    
    path_dict = {
        "vnum": path.vnum,
        "zone_vnum": path.zone_vnum,
        "name": path.name,
        "path_type": path.path_type,
        "coordinates": coordinates,
        "path_props": path.path_props,
        "path_type_name": get_path_type_name(path.path_type)
    }
    
    return PathResponse(**path_dict)

@router.post("/", response_model=PathResponse, status_code=status.HTTP_201_CREATED)
def create_path(path: PathCreate, db: Session = Depends(get_db)):
    """
    Create a new path.
    
    Paths represent linear features that override terrain during wilderness generation:
    
    **PATH_ROAD (1)**: Paved roads for fast travel
    - path_props: Road sector type (typically 11=NS, 12=EW, 13=Intersection)
    - Examples: "King's Highway", "Trade Route", "Military Road"
    
    **PATH_DIRT_ROAD (2)**: Unpaved roads for rural areas  
    - path_props: Dirt road sector type (typically 26=NS, 27=EW, 28=Intersection)
    - Examples: "Village Path", "Farm Road", "Logging Trail"
    
    **PATH_GEOGRAPHIC (3)**: Natural linear features
    - path_props: Appropriate terrain sector for the feature
    - Examples: "Mountain Ridge", "Valley Floor", "Cliff Edge"
    
    **PATH_RIVER (5)**: Major waterways
    - path_props: Water sector type (typically 6=Swim, 7=Deep, 36=River)
    - Examples: "Great River", "Rapids", "Mighty Current"
    
    **PATH_STREAM (6)**: Minor waterways
    - path_props: Shallow water sector (typically 6=Swim, 36=River)
    - Examples: "Mountain Stream", "Creek", "Brook"
    
    **Game Integration**: Paths are processed after regions and override their effects.
    The linestring geometry is used for efficient spatial queries to determine path intersections.
    Visual glyphs are automatically selected based on path orientation at each coordinate.
    """
    try:
        # Check if vnum already exists
        existing_path = db.query(Path).filter(Path.vnum == path.vnum).first()
        if existing_path:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Path with vnum {path.vnum} already exists"
            )
        
        # Convert coordinates to MySQL LINESTRING
        linestring_wkt = coordinates_to_linestring_wkt(path.coordinates)
        
        # Create path with MySQL LINESTRING
        db.execute(text("""
            INSERT INTO path_data (vnum, zone_vnum, name, path_type, path_linestring, path_props)
            VALUES (:vnum, :zone_vnum, :name, :path_type, ST_GeomFromText(:linestring), :path_props)
        """), {
            "vnum": path.vnum,
            "zone_vnum": path.zone_vnum,
            "name": path.name,
            "path_type": path.path_type,
            "linestring": linestring_wkt,
            "path_props": path.path_props
        })
        
        db.commit()
        
        # Return the created path
        return get_path(path.vnum, db)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating path: {str(e)}"
        )

@router.put("/{vnum}", response_model=PathResponse)
def update_path(vnum: int, path_update: PathUpdate, db: Session = Depends(get_db)):
    """
    Update an existing path.
    
    Supports partial updates - only provided fields will be modified.
    Coordinate updates will regenerate the spatial LINESTRING geometry.
    """
    try:
        # Check if path exists
        existing_path = db.query(Path).filter(Path.vnum == vnum).first()
        if not existing_path:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Path with vnum {vnum} not found"
            )
        
        # Build update query dynamically
        update_data = path_update.dict(exclude_unset=True, exclude={'coordinates'})
        
        # Handle coordinates separately if provided
        if path_update.coordinates is not None:
            linestring_wkt = coordinates_to_linestring_wkt(path_update.coordinates)
            
            # Update with new linestring
            query_parts = []
            params = {"vnum": vnum, "linestring": linestring_wkt}
            
            for field, value in update_data.items():
                query_parts.append(f"{field} = :{field}")
                params[field] = value
            
            query_parts.append("path_linestring = ST_GeomFromText(:linestring)")
            
            if query_parts:
                query = f"UPDATE path_data SET {', '.join(query_parts)} WHERE vnum = :vnum"
                db.execute(text(query), params)
        else:
            # Update without linestring changes
            if update_data:
                query_parts = [f"{field} = :{field}" for field in update_data.keys()]
                params = update_data.copy()
                params["vnum"] = vnum
                
                query = f"UPDATE path_data SET {', '.join(query_parts)} WHERE vnum = :vnum"
                db.execute(text(query), params)
        
        db.commit()
        
        # Return updated path
        return get_path(vnum, db)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating path: {str(e)}"
        )

@router.delete("/{vnum}", status_code=status.HTTP_204_NO_CONTENT)
def delete_path(vnum: int, db: Session = Depends(get_db)):
    """
    Delete a path.
    
    Warning: This will permanently remove the path from the wilderness system.
    Any references to this path in the game world will need to be updated separately.
    """
    try:
        result = db.execute(text("DELETE FROM path_data WHERE vnum = :vnum"), {"vnum": vnum})
        
        if result.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Path with vnum {vnum} not found"
            )
        
        db.commit()
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting path: {str(e)}"
        )

@router.get("/types", response_model=dict)
def get_path_types():
    """
    Get all available path types and sector mappings for the wilderness system.
    
    Returns complete information about path types, their typical sector usage,
    and how they integrate with the terrain generation system.
    """
    return {
        "path_types": {
            PATH_ROAD: {
                "name": "Paved Road",
                "description": "High-speed travel routes that provide fast movement",
                "path_props_usage": "Road sector type (typically 11,12,13)",
                "common_sectors": [11, 12, 13],
                "examples": ["King's Highway", "Trade Route", "Military Road"]
            },
            PATH_DIRT_ROAD: {
                "name": "Dirt Road", 
                "description": "Standard travel routes for rural areas",
                "path_props_usage": "Dirt road sector type (typically 26,27,28)",
                "common_sectors": [26, 27, 28], 
                "examples": ["Village Path", "Farm Road", "Logging Trail"]
            },
            PATH_GEOGRAPHIC: {
                "name": "Geographic Feature",
                "description": "Natural linear formations in the landscape",
                "path_props_usage": "Appropriate terrain sector type for the feature",
                "examples": ["Mountain Ridge", "Valley Floor", "Cliff Edge"]
            },
            PATH_RIVER: {
                "name": "River",
                "description": "Major waterways that affect movement and terrain",
                "path_props_usage": "Water sector type (typically 6,7,36)",
                "common_sectors": [6, 7, 36],
                "examples": ["Great River", "Rapids", "Mighty Current"]
            },
            PATH_STREAM: {
                "name": "Stream",
                "description": "Minor waterways and small creeks", 
                "path_props_usage": "Shallow water sector type (typically 6,36)",
                "common_sectors": [6, 36],
                "examples": ["Mountain Stream", "Creek", "Brook"]
            }
        },
        "sector_mapping": PATH_SECTOR_MAPPING,
        "coordinate_system": {
            "range": {"x": "-1024 to +1024", "y": "-1024 to +1024"},
            "linestring_format": "LINESTRING(x1 y1, x2 y2, x3 y3, ...)",
            "directions": {"north": "+Y", "south": "-Y", "east": "+X", "west": "-X"}
        },
        "processing_flow": [
            "1. Calculate base terrain using Perlin noise",
            "2. Apply region effects first (if any)",
            "3. Get enclosing paths for coordinate using spatial query", 
            "4. Apply path effects (override with path_props sector type)",
            "5. Determine appropriate glyph based on path orientation",
            "6. Return final sector type and glyph information"
        ],
        "glyph_system": {
            "description": "Paths use orientation-based glyphs for visual display",
            "types": {
                "NS": "North-South oriented path glyph",
                "EW": "East-West oriented path glyph", 
                "Intersection": "Where paths cross or meet"
            }
        }
    }
