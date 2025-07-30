from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..models.path import Path
from ..schemas.path import PathCreate, PathResponse, PathUpdate
from ..config.config_database import get_db

router = APIRouter()

@router.get("/", response_model=List[PathResponse])
def get_paths(db: Session = Depends(get_db)):
    """Get all paths"""
    try:
        paths = db.query(Path).all()
        return paths
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving paths: {str(e)}"
        )

@router.get("/{path_id}", response_model=PathResponse)
def get_path(path_id: int, db: Session = Depends(get_db)):
    """Get a specific path by ID"""
    path = db.query(Path).filter(Path.id == path_id).first()
    if not path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Path with id {path_id} not found"
        )
    return path

@router.post("/", response_model=PathResponse, status_code=status.HTTP_201_CREATED)
def create_path(path: PathCreate, db: Session = Depends(get_db)):
    """Create a new path"""
    try:
        # Check if vnum already exists
        existing_path = db.query(Path).filter(Path.vnum == path.vnum).first()
        if existing_path:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Path with vnum {path.vnum} already exists"
            )
        
        db_path = Path(**path.dict())
        db.add(db_path)
        db.commit()
        db.refresh(db_path)
        return db_path
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating path: {str(e)}"
        )

@router.put("/{path_id}", response_model=PathResponse)
def update_path(path_id: int, path_update: PathUpdate, db: Session = Depends(get_db)):
    """Update an existing path"""
    try:
        db_path = db.query(Path).filter(Path.id == path_id).first()
        if not db_path:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Path with id {path_id} not found"
            )
        
        # Update only provided fields
        update_data = path_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_path, field, value)
        
        db.commit()
        db.refresh(db_path)
        return db_path
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating path: {str(e)}"
        )

@router.delete("/{path_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_path(path_id: int, db: Session = Depends(get_db)):
    """Delete a path"""
    try:
        db_path = db.query(Path).filter(Path.id == path_id).first()
        if not db_path:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Path with id {path_id} not found"
            )
        
        db.delete(db_path)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting path: {str(e)}"
        )
