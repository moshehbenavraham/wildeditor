from sqlalchemy import Column, Integer, String, JSON
from ..config.config_database import Base

class Region(Base):
    __tablename__ = "regions"
    id = Column(Integer, primary_key=True, index=True)
    vnum = Column(Integer, unique=True, nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    coordinates = Column(JSON, nullable=False)
    properties = Column(String)
    color = Column(String)
