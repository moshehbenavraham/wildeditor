from sqlalchemy import Column, Integer, String
from sqlalchemy.dialects.mysql import LINESTRING
from ..config.config_database import Base

class Path(Base):
    """
    Path model representing linear features like roads, rivers, and trails.
    
    Maps to the path_data table in LuminariMUD's MySQL spatial database.
    Paths are stored as LINESTRING geometry for efficient spatial queries.
    
    Actual MySQL table structure:
    - vnum: int(11) PRIMARY KEY - Unique path identifier  
    - zone_vnum: int(11) DEFAULT 10000 - Zone this path belongs to
    - path_type: int(11) - Path type (roads, rivers, etc.)
    - name: varchar(50) - Path name
    - path_props: int(11) NULLABLE - Additional properties 
    - path_linestring: linestring NULLABLE - MySQL spatial linestring
    """
    __tablename__ = "path_data"
    
    vnum = Column(Integer, primary_key=True)  # Primary key, not auto-increment
    zone_vnum = Column(Integer, nullable=False, default=10000)  # Default zone
    path_type = Column(Integer, nullable=False)  # Path type (see PATH_* constants)
    name = Column(String(50), nullable=False)   # Path name (50 char limit from real DB)
    path_props = Column(Integer, nullable=True)  # Additional properties (nullable in real DB)
    path_linestring = Column(LINESTRING, nullable=True)  # MySQL spatial linestring (nullable)
