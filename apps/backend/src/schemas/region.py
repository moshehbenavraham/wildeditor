from pydantic import BaseModel
from typing import List, Dict, Optional

class RegionBase(BaseModel):
    vnum: int
    name: str
    type: str
    coordinates: List[Dict[str, float]]
    properties: Optional[str] = None
    color: Optional[str] = None

class RegionCreate(RegionBase):
    pass

class RegionUpdate(BaseModel):
    vnum: Optional[int] = None
    name: Optional[str] = None
    type: Optional[str] = None
    coordinates: Optional[List[Dict[str, float]]] = None
    properties: Optional[str] = None
    color: Optional[str] = None

class RegionResponse(RegionBase):
    id: int
    
    class Config:
        from_attributes = True
