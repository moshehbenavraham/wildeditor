from fastapi import FastAPI
from .routers.regions import router as regions_router
from .routers.paths import router as paths_router
from .routers.points import router as points_router

app = FastAPI()

app.include_router(regions_router, prefix="/api/regions", tags=["Regions"])
app.include_router(paths_router, prefix="/api/paths", tags=["Paths"])
app.include_router(points_router, prefix="/api/points", tags=["Points"])

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "wildeditor-backend"}
