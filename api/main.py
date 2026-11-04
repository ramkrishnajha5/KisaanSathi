"""FastAPI Main Application Entry Point for KisaanSathi.

MCA Minor Project: AI-powered Crop Health Scanner and Farmer Assistance Platform.
"""

from contextlib import asynccontextmanager
import json
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.config import settings
from api.routes import prediction, mandi, news, weather, tips
from database.connection import init_db
from utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan event handler: initializes database tables and resources."""
    logger.info("Starting up %s (Env: %s)...", settings.APP_NAME, settings.APP_ENV)
    init_db()
    logger.info("Database schema initialized.")
    yield
    logger.info("Shutting down %s...", settings.APP_NAME)


app = FastAPI(
    title="KisaanSathi API",
    description="AI-powered Crop Health Diagnosis & Farmer Advisory REST API",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Cross-Origin Resource Sharing (CORS) for Streamlit and mobile app clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(prediction.router)
app.include_router(mandi.router)
app.include_router(news.router)
app.include_router(weather.router)
app.include_router(tips.router)

# Mount samples directory for 1-click test leaf images
samples_dir = Path("data/samples")
if samples_dir.exists():
    app.mount("/samples", StaticFiles(directory=str(samples_dir)), name="samples")


@app.get("/api/v1/samples", tags=["Showcase Samples"])
def get_showcase_samples():
    """Returns curated showcase sample leaf metadata for 1-click diagnosis testing."""
    manifest_path = Path("data/samples/samples_manifest.json")
    if manifest_path.exists():
        with open(manifest_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


@app.get("/", tags=["Health Check"])
def health_check():
    """Root health-check endpoint confirming API operational status."""
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": "0.1.0",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host=settings.API_HOST, port=settings.API_PORT, reload=settings.DEBUG)
