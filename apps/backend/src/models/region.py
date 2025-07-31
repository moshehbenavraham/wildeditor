from sqlalchemy import Column, Integer, String, DateTime
from geoalchemy2 import Geometry
from ..config.config_database import Base

class Region(Base):
    __tablename__ = "region_data"
    
    vnum = Column(Integer, primary_key=True)  # Primary key, not auto-increment
    zone_vnum = Column(Integer, nullable=False)
    name = Column(String(50), nullable=True)
    region_type = Column(Integer, nullable=False)  # 1=Geographic, 2=Encounter, 3=Sector Transform, 4=Sector Override
    region_polygon = Column(Geometry('POLYGON'), nullable=True)  # MySQL spatial polygon type
    region_props = Column(Integer, nullable=True)  # Usage depends on region_type
    region_reset_data = Column(String(255), nullable=False)
    region_reset_time = Column(DateTime, nullable=False)
