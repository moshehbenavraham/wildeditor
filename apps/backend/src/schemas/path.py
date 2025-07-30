from pydantic import BaseModel
from typing import List, Dict, Optional

class PathBase(BaseModel):
    vnum: int
    name: str
    from_region: int
    to_region: int
    points: List[Dict[str, float]]
    properties: Optional[str] = None
    color: Optional[str] = None

class PathCreate(PathBase):
    pass

class PathUpdate(BaseModel):
    vnum: Optional[int] = None
    name: Optional[str] = None
    from_region: Optional[int] = None
    to_region: Optional[int] = None
    points: Optional[List[Dict[str, float]]] = None
    properties: Optional[str] = None
    color: Optional[str] = None

class PathResponse(PathBase):
    id: int
    
    class Config:
        from_attributes = True
