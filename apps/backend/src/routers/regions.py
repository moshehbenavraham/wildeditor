from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from datetime import datetime
from ..models.region import Region
from ..schemas.region import (
    RegionCreate, RegionResponse, RegionUpdate, create_landmark_region,
    get_region_type_name, get_sector_type_name, REGION_GEOGRAPHIC, REGION_ENCOUNTER,
    REGION_SECTOR_TRANSFORM, REGION_SECTOR, SECTOR_TYPES
)
from ..config.config_database import get_db

router = APIRouter()

def coordinates_to_polygon_wkt(coordinates: List[dict]) -> str:
    """Convert coordinate list to MySQL POLYGON WKT format"""
    if not coordinates:
        return ""
    
    # Handle single point (create a tiny polygon around it)
    if len(coordinates) == 1:
        x, y = coordinates[0]['x'], coordinates[0]['y']
        # Create a very small square around the point (0.001 radius)
        radius = 0.001
        coords = [
            {"x": x - radius, "y": y - radius},
            {"x": x + radius, "y": y - radius}, 
            {"x": x + radius, "y": y + radius},
            {"x": x - radius, "y": y + radius},
            {"x": x - radius, "y": y - radius}  # Close polygon
        ]
    else:
        coords = coordinates.copy()
    
    # Ensure polygon is closed (first point = last point)
    if len(coords) > 1 and coords[0] != coords[-1]:
        coords.append(coords[0])
    
    points = [f"{coord['x']} {coord['y']}" for coord in coords]
    return f"POLYGON(({', '.join(points)}))"

def polygon_wkt_to_coordinates(wkt: str) -> List[dict]:
    """Convert MySQL POLYGON WKT format to coordinate list"""
    if not wkt:
        return []
    
    # Parse WKT format: POLYGON((x1 y1, x2 y2, ...))
    try:
        # Remove POLYGON(( and ))
        coords_str = wkt.replace("POLYGON((", "").replace("))", "")
        point_pairs = coords_str.split(", ")
        
        coordinates = []
        for pair in point_pairs:
            if pair.strip():
                parts = pair.strip().split()
                if len(parts) >= 2:
                    x, y = float(parts[0]), float(parts[1])
                    coordinates.append({"x": x, "y": y})
        
        # Remove duplicate closing point if present
        if len(coordinates) > 1 and coordinates[0] == coordinates[-1]:
            coordinates = coordinates[:-1]
        
        # Handle point regions (landmarks) - check if all points are the same
        if len(coordinates) >= 3:
            unique_points = []
            for coord in coordinates:
                if not any(abs(coord['x'] - up['x']) < 0.001 and abs(coord['y'] - up['y']) < 0.001 for up in unique_points):
                    unique_points.append(coord)
            
            # If all points are essentially the same (landmark), return single point
            if len(unique_points) == 1:
                return [unique_points[0]]
            
            # If it's a very small polygon, might be a point region
            if len(unique_points) <= 4:
                x_coords = [c['x'] for c in unique_points]
                y_coords = [c['y'] for c in unique_points]
                x_range = max(x_coords) - min(x_coords) if len(x_coords) > 1 else 0
                y_range = max(y_coords) - min(y_coords) if len(y_coords) > 1 else 0
                
                # If it's a very small area (< 0.01), treat as point
                if x_range < 0.01 and y_range < 0.01:
                    center_x = sum(x_coords) / len(x_coords)
                    center_y = sum(y_coords) / len(y_coords)
                    return [{"x": center_x, "y": center_y}]
                
            coordinates = unique_points
            
        return coordinates
    except Exception as e:
        print(f"Error parsing WKT: {e}, WKT: {wkt}")
        return []

@router.get("/", response_model=List[RegionResponse])
def get_regions(
    region_type: Optional[int] = Query(None, description="Filter by region type (1=Geographic, 2=Encounter, 3=Sector Transform, 4=Sector Override)"),
    zone_vnum: Optional[int] = Query(None, description="Filter by zone vnum"),
    db: Session = Depends(get_db)
):
    """
    Get all regions, optionally filtered by type or zone.
    
    Regions are polygonal areas that modify terrain properties:
    
    - **REGION_GEOGRAPHIC (1)**: Named areas (forests, mountains) - Provides descriptive names without modifying terrain
    - **REGION_ENCOUNTER (2)**: Special encounter zones - Enables encounter spawning with reset timers  
    - **REGION_SECTOR_TRANSFORM (3)**: Terrain modification - Adds region_props to elevation then recalculates sector
    - **REGION_SECTOR (4)**: Complete terrain override - Replaces terrain with region_props sector type (0-36)
    
    Each region is stored as POLYGON geometry in MySQL and converted to coordinate arrays for the API.
    Regions are processed in database order during terrain generation, with later regions overriding earlier ones.
    """
    try:
        query = db.query(Region)
        if region_type:
            query = query.filter(Region.region_type == region_type)
        if zone_vnum:
            query = query.filter(Region.zone_vnum == zone_vnum)
        
        regions = query.all()
        
        # Convert to response format
        response_regions = []
        for region in regions:
            # Convert MySQL POLYGON to coordinates
            coordinates = []
            if region.region_polygon:
                # Use ST_AsText to get WKT format
                result = db.execute(text("SELECT ST_AsText(:polygon)"), {"polygon": region.region_polygon}).fetchone()
                if result:
                    coordinates = polygon_wkt_to_coordinates(result[0])
            
            # Handle MySQL zero datetime
            reset_time = region.region_reset_time
            if reset_time and reset_time.year < 1900:
                reset_time = datetime(2000, 1, 1)
            
            region_dict = {
                "vnum": region.vnum,
                "zone_vnum": region.zone_vnum,
                "name": region.name,
                "region_type": region.region_type,
                "coordinates": coordinates,
                "region_props": region.region_props,
                "region_reset_data": region.region_reset_data or "",
                "region_reset_time": reset_time,
                "region_type_name": get_region_type_name(region.region_type),
                "sector_type_name": get_sector_type_name(region.region_props) if region.region_type == REGION_SECTOR and region.region_props is not None else None
            }
            response_regions.append(RegionResponse(**region_dict))
        
        return response_regions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving regions: {str(e)}"
        )

@router.get("/types", response_model=dict)
def get_region_types():
    """
    Get all available region types and sector types for the wilderness system.
    
    Returns complete information about how each region type affects terrain generation
    and the valid sector types for REGION_SECTOR regions.
    """
    return {
        "region_types": {
            REGION_GEOGRAPHIC: {
                "name": "Geographic (Named areas and landmarks)",
                "description": "Provides contextual information for the dynamic description engine without modifying terrain. Used for naming terrain areas, geo-political boundaries, and landmarks",
                "region_props_usage": "Value ignored by game",
                "behavior": "No terrain modification, enhances descriptions and provides area context",
                "examples": ["Whispering Wood (area naming)", "Kingdom of Thay (geo-political)", "North Gate of Ashenport (landmark)"]
            },
            REGION_ENCOUNTER: {
                "name": "Encounter (Special spawning)", 
                "description": "Special encounter zones where specific encounters can spawn",
                "region_props_usage": "Value ignored by game",
                "behavior": "Enables encounter spawning with optional reset timers",
                "examples": ["Dragon Lair Territory", "Bandit Ambush Zone", "Monster Hunting Grounds"]
            },
            REGION_SECTOR_TRANSFORM: {
                "name": "Sector Transform (Elevation adjustment)",
                "description": "Terrain modification regions that adjust elevation values", 
                "region_props_usage": "Elevation adjustment value (positive or negative integer)",
                "behavior": "Adds region_props to elevation, then recalculates sector type",
                "examples": ["Magical uplift zone (+50)", "Cursed depression (-30)", "Earthquake damage (-20)"]
            },
            REGION_SECTOR: {
                "name": "Sector Override (Complete terrain override)",
                "description": "Complete terrain override regions",
                "region_props_usage": "Sector type ID (0-36) from sector_types array", 
                "behavior": "Completely replaces calculated terrain type with specified sector",
                "examples": ["Road through forest (sector 11)", "Lake in desert (sector 6)", "City district (sector 1)"]
            }
        },
        "sector_types": SECTOR_TYPES,
        "coordinate_system": {
            "range": {"x": "-1024 to +1024", "y": "-1024 to +1024"},
            "origin": "(0,0) at map center",
            "directions": {"north": "+Y", "south": "-Y", "east": "+X", "west": "-X"}
        },
        "processing_order": "Regions processed in database order - later regions override earlier ones"
    }

@router.get("/{vnum}", response_model=RegionResponse)
def get_region(vnum: int, db: Session = Depends(get_db)):
    """Get a specific region by vnum"""
    region = db.query(Region).filter(Region.vnum == vnum).first()
    if not region:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Region with vnum {vnum} not found"
        )
    
    # Convert MySQL POLYGON to coordinates
    coordinates = []
    if region.region_polygon:
        result = db.execute(text("SELECT ST_AsText(:polygon)"), {"polygon": region.region_polygon}).fetchone()
        if result:
            coordinates = polygon_wkt_to_coordinates(result[0])
    
    # Handle MySQL zero datetime  
    reset_time = region.region_reset_time
    if reset_time and reset_time.year < 1900:
        reset_time = datetime(2000, 1, 1)
    
    region_dict = {
        "vnum": region.vnum,
        "zone_vnum": region.zone_vnum,
        "name": region.name,
        "region_type": region.region_type,
        "coordinates": coordinates,
        "region_props": region.region_props,
        "region_reset_data": region.region_reset_data or "",
        "region_reset_time": reset_time,
        "region_type_name": get_region_type_name(region.region_type),
        "sector_type_name": get_sector_type_name(region.region_props) if region.region_type == REGION_SECTOR and region.region_props is not None else None
    }
    
    return RegionResponse(**region_dict)

@router.post("/", response_model=RegionResponse, status_code=status.HTTP_201_CREATED)
def create_region(region: RegionCreate, db: Session = Depends(get_db)):
    """
    Create a new region.
    
    Regions define how the wilderness system modifies terrain:
    
    **REGION_GEOGRAPHIC (1)**: Named geographic areas and landmarks
    - Provides contextual information for the dynamic description engine without modifying terrain
    - region_props value is ignored by the game
    - Used for naming existing terrain areas, defining geo-political boundaries, and creating landmarks
    - Examples: "Whispering Wood" (area naming), "Kingdom of Thay" (geo-political), "The North Gate of Ashenport" (landmark)
    
    **REGION_ENCOUNTER (2)**: Special encounter zones  
    - Enables encounter spawning with optional reset timers
    - region_props value is ignored by the game
    - Uses region_reset_data and region_reset_time for encounter management
    - Examples: "Dragon Lair Territory", "Bandit Ambush Zone"
    
    **REGION_SECTOR_TRANSFORM (3)**: Terrain modification
    - Adds region_props value to existing elevation, then recalculates sector type
    - region_props: Elevation adjustment (positive or negative integer)
    - Examples: Magical uplift (+50), Cursed depression (-30), Earthquake damage (-20)
    
    **REGION_SECTOR (4)**: Complete terrain override
    - Completely replaces calculated terrain type with specified sector
    - region_props: Sector type ID (0-36) from the complete sector types list
    - Examples: Road through forest (sector 11), Lake in desert (sector 6), City district (sector 1)
    
    The coordinate array is automatically converted to MySQL POLYGON geometry for efficient spatial queries.
    """
    try:
        # Check if vnum already exists
        existing_region = db.query(Region).filter(Region.vnum == region.vnum).first()
        if existing_region:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Region with vnum {region.vnum} already exists"
            )
        
        # Convert coordinates to MySQL POLYGON
        polygon_wkt = coordinates_to_polygon_wkt(region.coordinates)
        
        # Create region with MySQL POLYGON
        db.execute(text("""
            INSERT INTO region_data (vnum, zone_vnum, name, region_type, region_polygon, region_props, region_reset_data, region_reset_time)
            VALUES (:vnum, :zone_vnum, :name, :region_type, ST_GeomFromText(:polygon), :region_props, :region_reset_data, :region_reset_time)
        """), {
            "vnum": region.vnum,
            "zone_vnum": region.zone_vnum,
            "name": region.name,
            "region_type": region.region_type,
            "polygon": polygon_wkt,
            "region_props": region.region_props,
            "region_reset_data": region.region_reset_data,
            "region_reset_time": region.region_reset_time
        })
        
        db.commit()
        
        # Return the created region
        return get_region(region.vnum, db)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating region: {str(e)}"
        )

@router.post("/landmarks", response_model=RegionResponse, status_code=status.HTTP_201_CREATED)
def create_landmark(
    x: float = Query(..., description="X coordinate for the landmark"),
    y: float = Query(..., description="Y coordinate for the landmark"),
    name: str = Query(..., description="Name of the landmark"),
    vnum: int = Query(..., description="Unique vnum for the landmark"),
    zone_vnum: int = Query(..., description="Zone vnum for the landmark"),
    radius: Optional[float] = Query(0.2, description="Radius around the point (default 0.2)"),
    db: Session = Depends(get_db)
):
    """
    Create a landmark/point as a small geographic region.
    
    Landmarks are single-point geographic regions used by the dynamic description 
    engine to provide contextual references for room descriptions. Common examples
    include city gates, notable buildings, geographical features, and other points
    of interest that help generate more immersive wilderness descriptions.
    
    This creates a small square polygon around the specified coordinate.
    """
    try:
        # Check if vnum already exists
        existing_region = db.query(Region).filter(Region.vnum == vnum).first()
        if existing_region:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Region with vnum {vnum} already exists"
            )
        
        # Create landmark region data (as geographic type)
        landmark_data = create_landmark_region(x, y, name, vnum, zone_vnum, radius)
        landmark = RegionCreate(**landmark_data)
        
        return create_region(landmark, db)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating landmark: {str(e)}"
        )

@router.put("/{vnum}", response_model=RegionResponse)
def update_region(vnum: int, region_update: RegionUpdate, db: Session = Depends(get_db)):
    """Update an existing region"""
    try:
        # Check if region exists
        existing_region = db.query(Region).filter(Region.vnum == vnum).first()
        if not existing_region:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Region with vnum {vnum} not found"
            )
        
        # Build update query dynamically
        update_data = region_update.dict(exclude_unset=True, exclude={'coordinates'})
        
        # Handle coordinates separately if provided
        if region_update.coordinates is not None:
            polygon_wkt = coordinates_to_polygon_wkt(region_update.coordinates)
            
            # Update with new polygon
            query_parts = []
            params = {"vnum": vnum, "polygon": polygon_wkt}
            
            for field, value in update_data.items():
                query_parts.append(f"{field} = :{field}")
                params[field] = value
            
            query_parts.append("region_polygon = ST_GeomFromText(:polygon)")
            
            if query_parts:
                query = f"UPDATE region_data SET {', '.join(query_parts)} WHERE vnum = :vnum"
                db.execute(text(query), params)
        else:
            # Update without polygon changes
            if update_data:
                query_parts = [f"{field} = :{field}" for field in update_data.keys()]
                params = update_data.copy()
                params["vnum"] = vnum
                
                query = f"UPDATE region_data SET {', '.join(query_parts)} WHERE vnum = :vnum"
                db.execute(text(query), params)
        
        db.commit()
        
        # Return updated region
        return get_region(vnum, db)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating region: {str(e)}"
        )

@router.delete("/{vnum}", status_code=status.HTTP_204_NO_CONTENT)
def delete_region(vnum: int, db: Session = Depends(get_db)):
    """Delete a region"""
    try:
        result = db.execute(text("DELETE FROM region_data WHERE vnum = :vnum"), {"vnum": vnum})
        
        if result.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Region with vnum {vnum} not found"
            )
        
        db.commit()
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting region: {str(e)}"
        )
