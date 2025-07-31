"""
Simple smoke tests for Wildeditor Backend API
These tests focus on basic functionality without database dependencies
"""
import pytest
import os
import sys

# Set up environment before imports
os.environ["MYSQL_DATABASE_URL"] = "mysql+pymysql://test:test@localhost:3306/test_db"

def test_imports():
    """Test that basic imports work"""
    try:
        sys.path.insert(0, 'src')
        import src.main
        import src.schemas.region
        import src.schemas.path
        assert True
    except ImportError as e:
        pytest.fail(f"Import failed: {e}")

def test_region_constants():
    """Test that region constants are defined"""
    sys.path.insert(0, 'src')
    from src.schemas.region import REGION_GEOGRAPHIC, REGION_ENCOUNTER
    assert REGION_GEOGRAPHIC == 1
    assert REGION_ENCOUNTER == 2

def test_path_constants():
    """Test that path constants are defined"""
    sys.path.insert(0, 'src')
    from src.schemas.path import PATH_TYPES
    assert isinstance(PATH_TYPES, dict)
    assert len(PATH_TYPES) > 0

def test_fastapi_app_creation():
    """Test that FastAPI app can be created"""
    sys.path.insert(0, 'src')
    from src.main import app
    assert app is not None
    assert hasattr(app, 'routes')

@pytest.mark.unit
def test_health_endpoint():
    """Test the health endpoint without database"""
    sys.path.insert(0, 'src')
    from fastapi.testclient import TestClient
    from src.main import app
    
    client = TestClient(app)
    response = client.get("/api/health")
    
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "healthy"
    assert data["service"] == "wildeditor-backend"

@pytest.mark.unit
def test_root_endpoint():
    """Test the root endpoint"""
    sys.path.insert(0, 'src')
    from fastapi.testclient import TestClient
    from src.main import app
    
    client = TestClient(app)
    response = client.get("/")
    
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "docs_url" in data
    assert "health_url" in data

@pytest.mark.unit  
def test_docs_endpoint():
    """Test that docs endpoint is accessible"""
    sys.path.insert(0, 'src')
    from fastapi.testclient import TestClient
    from src.main import app
    
    client = TestClient(app)
    response = client.get("/docs")
    
    assert response.status_code == 200

if __name__ == "__main__":
    # Run tests manually
    print("Running smoke tests...")
    
    test_imports()
    print("✅ Imports work")
    
    test_region_constants()
    print("✅ Region constants defined")
    
    test_path_constants()
    print("✅ Path constants defined")
    
    test_fastapi_app_creation()
    print("✅ FastAPI app creation works")
    
    test_health_endpoint()
    print("✅ Health endpoint works")
    
    test_root_endpoint()
    print("✅ Root endpoint works")
    
    test_docs_endpoint()
    print("✅ Docs endpoint works")
    
    print("🎉 All smoke tests passed!")
