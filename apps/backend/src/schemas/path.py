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

class PathResponse(PathBase):
    id: int
    class Config:
        orm_mode = True
