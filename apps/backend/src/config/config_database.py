from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables from .env file (if it exists)
load_dotenv()

DATABASE_URL = os.getenv("MYSQL_DATABASE_URL")
if not DATABASE_URL:
    # For testing and CI environments, provide a default test database URL
    # This prevents import errors when no .env file is present
    if os.getenv("TESTING") or "pytest" in os.environ.get("_", ""):
        DATABASE_URL = "mysql+pymysql://test:test@localhost:3306/test_db"
    else:
        raise RuntimeError("MYSQL_DATABASE_URL environment variable not set. Please configure it in your .env file.")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
