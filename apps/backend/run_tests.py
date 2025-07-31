#!/usr/bin/env python3
"""
Test runner for Wildeditor Backend
Run this to verify tests work locally before deployment
"""
import os
import sys
import subprocess

def main():
    # Change to backend directory
    backend_dir = os.path.join(os.path.dirname(__file__), '.')
    os.chdir(backend_dir)
    
    print("🧪 Running Wildeditor Backend Tests")
    print("=" * 50)
    
    # Check if pytest is installed
    try:
        import pytest
        print("✅ pytest is available")
    except ImportError:
        print("❌ pytest not installed. Installing...")
        subprocess.run([sys.executable, "-m", "pip", "install", "pytest", "pytest-asyncio", "httpx"])
    
    # Set PYTHONPATH
    env = os.environ.copy()
    env['PYTHONPATH'] = 'src'
    
    print("\n📋 Running unit tests...")
    result = subprocess.run([
        sys.executable, "-m", "pytest", 
        "tests/", 
        "-v", 
        "-m", "not integration",
        "--tb=short"
    ], env=env)
    
    if result.returncode == 0:
        print("\n✅ All tests passed!")
        print("\n🚀 Backend is ready for deployment!")
    else:
        print("\n❌ Some tests failed!")
        print("Please fix the failing tests before deploying.")
        return False
    
    # Run smoke test
    print("\n🔥 Running smoke test...")
    try:
        sys.path.insert(0, 'src')
        from src.main import app
        from fastapi.testclient import TestClient
        
        client = TestClient(app)
        response = client.get('/api/health')
        
        if response.status_code == 200:
            print("✅ Smoke test passed - API starts correctly")
            return True
        else:
            print(f"❌ Smoke test failed - Health check returned {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Smoke test failed with error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
