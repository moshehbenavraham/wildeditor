from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..models.region import Region
from ..schemas.region import RegionCreate, RegionResponse
from ..config.config_database import get_db

router = APIRouter()

@router.get("/", response_model=list[RegionResponse])
def get_regions(db: Session = Depends(get_db)):
    return db.query(Region).all()

@router.post("/", response_model=RegionResponse)
def create_region(region: RegionCreate, db: Session = Depends(get_db)):
    db_region = Region(**region.dict())
    db.add(db_region)
    db.commit()
    db.refresh(db_region)
    return db_region
