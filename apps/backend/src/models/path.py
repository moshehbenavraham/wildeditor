from sqlalchemy import Column, Integer, String, JSON
from ..config.config_database import Base

class Path(Base):
    __tablename__ = "path_data"
    
    id = Column(Integer, primary_key=True, index=True)
    vnum = Column(Integer, unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    from_region = Column(Integer, nullable=False)
    to_region = Column(Integer, nullable=False)
    points = Column(JSON, nullable=False)
    properties = Column(String(1000))
    color = Column(String(7))  # Hex color code
