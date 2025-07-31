"""
Test configuration and fixtures for Wildeditor Backend tests
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
import os
import sys
from pathlib import Path

# Set test environment variable BEFORE importing any modules
os.environ["MYSQL_DATABASE_URL"] = "mysql+pymysql://test:test@localhost:3306/test_db"
os.environ["TESTING"] = "1"  # Flag to indicate we're in testing mode

# Add both the parent directory (for 'src' module) and src directory itself to Python path
# This ensures imports work in both local development and CI environments
current_dir = Path(__file__).parent
backend_dir = current_dir.parent  # apps/backend directory
src_dir = backend_dir / "src"

# Add parent directory first (so 'src' can be imported as a module)
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Also add src directory for direct imports
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))


@pytest.fixture
def mock_database():
    """Mock database connection for tests that don't need real DB"""
    with patch('src.config.config_database.engine') as mock_engine:
        mock_engine.connect.return_value.__enter__.return_value = Mock()
        yield mock_engine


@pytest.fixture
def test_client():
    """Create a test client for the FastAPI app"""
    from src.main import app
    return TestClient(app)


@pytest.fixture(scope="session")
def test_env():
    """Set up test environment variables"""
    # Mock the database URL to prevent connection attempts during testing
    os.environ["MYSQL_DATABASE_URL"] = "mysql+pymysql://test:test@localhost:3306/test_db"
    yield
    # Clean up
    if "MYSQL_DATABASE_URL" in os.environ:
        del os.environ["MYSQL_DATABASE_URL"]


# Automatically use test environment for all tests
@pytest.fixture(autouse=True)
def setup_test_env(test_env):
    """Automatically set up test environment for all tests"""
    pass
