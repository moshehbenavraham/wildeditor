from sqlalchemy import Column, Integer, String, JSON
from ..config.config_database import Base

class Region(Base):
    __tablename__ = "region_data"
    
    id = Column(Integer, primary_key=True, index=True)
    vnum = Column(Integer, unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)
    coordinates = Column(JSON, nullable=False)
    properties = Column(String(1000))
    color = Column(String(7))  # Hex color code
