from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..models.point import Point
from ..schemas.point import PointCreate, PointResponse
from ..config.config_database import get_db

router = APIRouter()

@router.get("/", response_model=list[PointResponse])
def get_points(db: Session = Depends(get_db)):
    return db.query(Point).all()

@router.post("/", response_model=PointResponse)
def create_point(point: PointCreate, db: Session = Depends(get_db)):
    db_point = Point(**point.dict())
    db.add(db_point)
    db.commit()
    db.refresh(db_point)
    return db_point
