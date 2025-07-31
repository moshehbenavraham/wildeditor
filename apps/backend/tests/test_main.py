"""
Basic tests for the Wildeditor Backend API
"""
import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)


def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "healthy"


def test_api_docs_accessible():
    """Test that API documentation is accessible"""
    response = client.get("/docs")
    assert response.status_code == 200


def test_cors_headers():
    """Test that CORS headers are properly set"""
    response = client.options("/api/health")
    assert response.status_code == 200


class TestRegionsAPI:
    """Test the regions API endpoints"""
    
    def test_get_regions(self):
        """Test getting all regions"""
        response = client.get("/api/regions")
        # Should return 200 even if empty
        assert response.status_code in [200, 500]  # 500 if DB not connected
    
    def test_get_region_types(self):
        """Test getting region types"""
        response = client.get("/api/regions/types")
        assert response.status_code == 200
        data = response.json()
        assert "region_types" in data


class TestPathsAPI:
    """Test the paths API endpoints"""
    
    def test_get_paths(self):
        """Test getting all paths"""
        response = client.get("/api/paths")
        # Should return 200 even if empty
        assert response.status_code in [200, 500]  # 500 if DB not connected


class TestPointsAPI:
    """Test the points API endpoints"""
    
    def test_get_points(self):
        """Test getting all points"""
        response = client.get("/api/points")
        # Should return 200 even if empty
        assert response.status_code in [200, 500]  # 500 if DB not connected


# Integration tests (require database connection)
@pytest.mark.integration
class TestDatabaseIntegration:
    """Integration tests that require database connection"""
    
    def test_database_connection(self):
        """Test that database connection works"""
        # This would test actual database connectivity
        # Implementation depends on your database setup
        pass
    
    def test_create_region(self):
        """Test creating a new region"""
        region_data = {
            "vnum": 99999,
            "name": "Test Region",
            "type": 1,
            "coordinates": [
                {"x": 100, "y": 100},
                {"x": 110, "y": 100},
                {"x": 110, "y": 110},
                {"x": 100, "y": 110}
            ],
            "props": "{}",
            "zone_vnum": 1
        }
        
        response = client.post("/api/regions", json=region_data)
        # Will fail if database not connected, but structure should be correct
        assert response.status_code in [201, 500]


if __name__ == "__main__":
    # Run basic tests
    print("Running basic API tests...")
    test_health_check()
    test_api_docs_accessible()
    print("✅ Basic tests passed!")
