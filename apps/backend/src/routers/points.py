from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from ..models.region import Region
from ..models.path import Path
from ..schemas.region import get_region_type_name, get_sector_type_name, REGION_SECTOR
from ..config.config_database import get_db

router = APIRouter()

@router.get("/", response_model=dict)
def get_point_info(
    x: float = Query(..., description="X coordinate"), 
    y: float = Query(..., description="Y coordinate"),
    radius: Optional[float] = Query(0.1, description="Search radius around the point"),
    db: Session = Depends(get_db)
):
    """
    Get information about what regions and paths exist at or near a specific coordinate point.
    This is useful for finding what's at a specific location on the map.
    """
    try:
        # Create a point geometry for spatial queries
        point_wkt = f"POINT({x} {y})"
        
        # Find regions that contain this point or are within radius
        regions_query = text("""
            SELECT vnum, zone_vnum, name, region_type, region_props, region_reset_data, region_reset_time,
                   ST_AsText(region_polygon) as polygon_wkt
            FROM region_data 
            WHERE region_polygon IS NOT NULL 
            AND (ST_Contains(region_polygon, ST_GeomFromText(:point)) 
                 OR ST_Distance(region_polygon, ST_GeomFromText(:point)) <= :radius)
        """)
        
        region_results = db.execute(regions_query, {
            "point": point_wkt, 
            "radius": radius
        }).fetchall()
        
        matching_regions = []
        for row in region_results:
            region_info = {
                "vnum": row.vnum,
                "zone_vnum": row.zone_vnum,
                "name": row.name,
                "region_type": row.region_type,
                "region_type_name": get_region_type_name(row.region_type),
                "region_props": row.region_props,
                "sector_type_name": get_sector_type_name(row.region_props) if row.region_type == REGION_SECTOR and row.region_props else None,
                "region_reset_data": row.region_reset_data,
                "region_reset_time": row.region_reset_time
            }
            matching_regions.append(region_info)
        
        # Find paths that pass through or near this point
        # Note: This is a simplified check - you may want to enhance with proper line-to-point distance
        paths = db.query(Path).all()
        matching_paths = []
        
        for path in paths:
            # Parse the points JSON - this will need to be adapted based on your path structure
            try:
                if hasattr(path, 'points') and path.points:
                    import json
                    points = path.points if isinstance(path.points, list) else json.loads(path.points)
                    
                    # Check if point is near the path
                    if _point_near_path(x, y, points, radius):
                        path_info = {
                            "vnum": path.vnum,
                            "name": path.name,
                            "from_region": path.from_region,
                            "to_region": path.to_region,
                            "properties": path.properties,
                            "color": path.color
                        }
                        matching_paths.append(path_info)
            except Exception:
                # Skip paths with invalid point data
                continue
        
        return {
            "coordinate": {"x": x, "y": y},
            "radius": radius,
            "regions": matching_regions,
            "paths": matching_paths,
            "summary": {
                "region_count": len(matching_regions),
                "path_count": len(matching_paths)
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving point information: {str(e)}"
        )

def _point_near_path(x: float, y: float, path_points: List[dict], radius: float) -> bool:
    """
    Check if a point is near any segment of a path.
    """
    if not path_points or len(path_points) < 2:
        return False
    
    # Check distance to each point in the path
    for point in path_points:
        try:
            point_x = point.get('x', 0)
            point_y = point.get('y', 0)
            distance = ((x - point_x) ** 2 + (y - point_y) ** 2) ** 0.5
            if distance <= radius:
                return True
        except (TypeError, KeyError):
            continue
    
    return False
