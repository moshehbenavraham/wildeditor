from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..models.point import Point
from ..schemas.point import PointCreate, PointResponse, PointUpdate
from ..config.config_database import get_db

router = APIRouter()

@router.get("/", response_model=List[PointResponse])
def get_points(db: Session = Depends(get_db)):
    """Get all points"""
    try:
        points = db.query(Point).all()
        return points
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving points: {str(e)}"
        )

@router.get("/{point_id}", response_model=PointResponse)
def get_point(point_id: int, db: Session = Depends(get_db)):
    """Get a specific point by ID"""
    point = db.query(Point).filter(Point.id == point_id).first()
    if not point:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Point with id {point_id} not found"
        )
    return point

@router.post("/", response_model=PointResponse, status_code=status.HTTP_201_CREATED)
def create_point(point: PointCreate, db: Session = Depends(get_db)):
    """Create a new point"""
    try:
        # Check if vnum already exists
        existing_point = db.query(Point).filter(Point.vnum == point.vnum).first()
        if existing_point:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Point with vnum {point.vnum} already exists"
            )
        
        db_point = Point(**point.dict())
        db.add(db_point)
        db.commit()
        db.refresh(db_point)
        return db_point
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating point: {str(e)}"
        )

@router.put("/{point_id}", response_model=PointResponse)
def update_point(point_id: int, point_update: PointUpdate, db: Session = Depends(get_db)):
    """Update an existing point"""
    try:
        db_point = db.query(Point).filter(Point.id == point_id).first()
        if not db_point:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Point with id {point_id} not found"
            )
        
        # Update only provided fields
        update_data = point_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_point, field, value)
        
        db.commit()
        db.refresh(db_point)
        return db_point
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating point: {str(e)}"
        )

@router.delete("/{point_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_point(point_id: int, db: Session = Depends(get_db)):
    """Delete a point"""
    try:
        db_point = db.query(Point).filter(Point.id == point_id).first()
        if not db_point:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Point with id {point_id} not found"
            )
        
        db.delete(db_point)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting point: {str(e)}"
        )
