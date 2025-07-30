from sqlalchemy import Column, Integer, Float, String
from ..config.config_database import Base

class Point(Base):
    __tablename__ = "points"  # Assuming this table exists or will be created
    
    id = Column(Integer, primary_key=True, index=True)
    vnum = Column(Integer, unique=True, nullable=False)
    x = Column(Float, nullable=False)
    y = Column(Float, nullable=False)
    z = Column(Float, nullable=True)
    region_id = Column(Integer, nullable=False)
    properties = Column(String(1000))
