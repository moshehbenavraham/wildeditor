from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers.regions import router as regions_router
from .routers.paths import router as paths_router
from .routers.points import router as points_router

app = FastAPI(
    title="Wildeditor Backend API",
    description="Backend API for the Luminari Wilderness Editor",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Frontend development servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(regions_router, prefix="/api/regions", tags=["Regions"])
app.include_router(paths_router, prefix="/api/paths", tags=["Paths"])
app.include_router(points_router, prefix="/api/points", tags=["Points"])

@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "service": "wildeditor-backend",
        "version": "1.0.0"
    }

@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Wildeditor Backend API",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }
