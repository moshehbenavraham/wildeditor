from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..models.path import Path
from ..schemas.path import PathCreate, PathResponse
from ..config.config_database import get_db

router = APIRouter()

@router.get("/", response_model=list[PathResponse])
def get_paths(db: Session = Depends(get_db)):
    return db.query(Path).all()

@router.post("/", response_model=PathResponse)
def create_path(path: PathCreate, db: Session = Depends(get_db)):
    db_path = Path(**path.dict())
    db.add(db_path)
    db.commit()
    db.refresh(db_path)
    return db_path
