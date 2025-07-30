#!/usr/bin/env python3
"""
Development server startup script for Wildeditor Backend
"""

import uvicorn
import os
from pathlib import Path

if __name__ == "__main__":
    # Change to the backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    print("🚀 Starting Wildeditor Backend Development Server")
    print("=" * 50)
    print("📍 API Documentation: http://localhost:8000/docs")
    print("📍 Health Check: http://localhost:8000/api/health")
    print("📍 ReDoc: http://localhost:8000/redoc")
    print("=" * 50)
    
    # Start the development server
    uvicorn.run(
        "src.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        reload_dirs=["src"],
        log_level="info"
    )
