#!/usr/bin/env python3
"""
Debug test to check API endpoints
"""
import os
import sys
from pathlib import Path

# Set test environment variable BEFORE importing any modules
os.environ["MYSQL_DATABASE_URL"] = "mysql+pymysql://test:test@localhost:3306/test_db"

# Add the src directory to the Python path
sys.path.append(str(Path(__file__).parent / "src"))

from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_endpoints():
    print("Testing API endpoints...")
    
    # Test health endpoint
    response = client.get("/api/health")
    print(f"Health endpoint: {response.status_code} - {response.text}")
    
    # Test regions root
    response = client.get("/api/regions")
    print(f"Regions root: {response.status_code} - {response.text[:200]}")
    
    # Test regions types
    response = client.get("/api/regions/types")
    print(f"Regions types: {response.status_code} - {response.text[:200]}")
    
    # Test paths types
    response = client.get("/api/paths/types")
    print(f"Paths types: {response.status_code} - {response.text[:200]}")

if __name__ == "__main__":
    test_endpoints()
