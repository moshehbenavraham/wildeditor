"""
Simple smoke tests for Wildeditor Backend API
These tests focus on basic functionality without database dependencies
"""
import pytest
import os
import sys
from pathlib import Path

# Set up environment before imports
os.environ["MYSQL_DATABASE_URL"] = "mysql+pymysql://test:test@localhost:3306/test_db"

# Ensure proper path setup for imports
def setup_import_paths():
    """Set up import paths for both local and CI environments"""
    current_dir = Path(__file__).parent
    backend_dir = current_dir.parent  # apps/backend directory
    src_dir = backend_dir / "src"
    
    # Add parent directory first (so 'src' can be imported as a module)
    if str(backend_dir) not in sys.path:
        sys.path.insert(0, str(backend_dir))
    
    # Also add src directory for direct imports
    if str(src_dir) not in sys.path:
        sys.path.insert(0, str(src_dir))

def test_imports():
    """Test that basic imports work"""
    try:
        setup_import_paths()
        import src.main
        import src.schemas.region
        import src.schemas.path
        assert True
    except ImportError as e:
        pytest.fail(f"Import failed: {e}")

def test_region_constants():
    """Test that region constants are defined"""
    setup_import_paths()
    from src.schemas.region import REGION_GEOGRAPHIC, REGION_ENCOUNTER
    assert REGION_GEOGRAPHIC == 1
    assert REGION_ENCOUNTER == 2

def test_path_constants():
    """Test that path constants are defined"""
    setup_import_paths()
    from src.schemas.path import PATH_TYPES
    assert isinstance(PATH_TYPES, dict)
    assert len(PATH_TYPES) > 0

def test_fastapi_app_creation():
    """Test that FastAPI app can be created"""
    setup_import_paths()
    from src.main import app
    assert app is not None
    assert hasattr(app, 'routes')

@pytest.mark.unit
def test_health_endpoint():
    """Test the health endpoint without database"""
    setup_import_paths()
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
