from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..models.region import Region
from ..schemas.region import RegionCreate, RegionResponse, RegionUpdate
from ..config.config_database import get_db

router = APIRouter()

@router.get("/", response_model=List[RegionResponse])
def get_regions(db: Session = Depends(get_db)):
    """Get all regions"""
    try:
        regions = db.query(Region).all()
        return regions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving regions: {str(e)}"
        )

@router.get("/{region_id}", response_model=RegionResponse)
def get_region(region_id: int, db: Session = Depends(get_db)):
    """Get a specific region by ID"""
    region = db.query(Region).filter(Region.id == region_id).first()
    if not region:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Region with id {region_id} not found"
        )
    return region

@router.post("/", response_model=RegionResponse, status_code=status.HTTP_201_CREATED)
def create_region(region: RegionCreate, db: Session = Depends(get_db)):
    """Create a new region"""
    try:
        # Check if vnum already exists
        existing_region = db.query(Region).filter(Region.vnum == region.vnum).first()
        if existing_region:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Region with vnum {region.vnum} already exists"
            )
        
        db_region = Region(**region.dict())
        db.add(db_region)
        db.commit()
        db.refresh(db_region)
        return db_region
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating region: {str(e)}"
        )

@router.put("/{region_id}", response_model=RegionResponse)
def update_region(region_id: int, region_update: RegionUpdate, db: Session = Depends(get_db)):
    """Update an existing region"""
    try:
        db_region = db.query(Region).filter(Region.id == region_id).first()
        if not db_region:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Region with id {region_id} not found"
            )
        
        # Update only provided fields
        update_data = region_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_region, field, value)
        
        db.commit()
        db.refresh(db_region)
        return db_region
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating region: {str(e)}"
        )

@router.delete("/{region_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_region(region_id: int, db: Session = Depends(get_db)):
    """Delete a region"""
    try:
        db_region = db.query(Region).filter(Region.id == region_id).first()
        if not db_region:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Region with id {region_id} not found"
            )
        
        db.delete(db_region)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting region: {str(e)}"
        )
