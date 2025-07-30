#!/usr/bin/env python3
"""
Database setup and testing script for Wildeditor Backend
"""

import os
import sys
from pathlib import Path

# Add the src directory to the Python path
sys.path.append(str(Path(__file__).parent / "src"))

from src.config.config_database import engine, Base
from src.models.region import Region
from src.models.path import Path
from src.models.point import Point

def test_connection():
    """Test database connection"""
    try:
        # Test connection
        with engine.connect() as connection:
            print("✅ Database connection successful!")
            
        # Test if tables exist
        from sqlalchemy import inspect
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        
        expected_tables = ["region_data", "path_data", "points"]
        
        print(f"\n📋 Existing tables: {existing_tables}")
        
        for table in expected_tables:
            if table in existing_tables:
                print(f"✅ Table '{table}' exists")
            else:
                print(f"❌ Table '{table}' missing")
                
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def create_tables():
    """Create tables if they don't exist"""
    try:
        print("Creating tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Tables created successfully!")
        return True
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False

if __name__ == "__main__":
    print("Wildeditor Backend Database Setup")
    print("=" * 40)
    
    # Check environment variables
    db_url = os.getenv("MYSQL_DATABASE_URL")
    if not db_url:
        print("❌ MYSQL_DATABASE_URL environment variable not set")
        print("Please ensure your .env file is configured correctly")
        sys.exit(1)
    
    print(f"🔗 Using database URL: {db_url.replace(db_url.split('@')[0].split('//')[1], '***:***')}")
    
    # Test connection
    if test_connection():
        print("\n🚀 Backend is ready for deployment!")
    else:
        print("\n💡 To create missing tables, run:")
        print("python database_setup.py --create-tables")
        
        if "--create-tables" in sys.argv:
            create_tables()
