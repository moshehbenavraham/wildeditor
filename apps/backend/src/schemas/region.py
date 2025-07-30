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

class RegionResponse(RegionBase):
    id: int
    class Config:
        orm_mode = True
