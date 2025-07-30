from pydantic import BaseModel
from typing import Optional

class PointBase(BaseModel):
    vnum: int
    x: float
    y: float
    z: Optional[float] = None
    region_id: int
    properties: Optional[str] = None

class PointCreate(PointBase):
    pass

class PointResponse(PointBase):
    id: int
    class Config:
        orm_mode = True
