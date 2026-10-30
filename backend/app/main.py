import logging
import sys
import asyncio
from contextlib import asynccontextmanager

if sys.platform == "win32":
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    except Exception:
        pass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.config import settings
from backend.app.database import init_db
from backend.app.services.browser_engine import browser_engine

# Import Routers
from backend.app.api.routes import (
    projects,
    scans,
    pages,
    components,
    design_system,
    assets,
    network,
    backend_analysis,
    database_analysis,
    ai_analysis,
    blueprints,
    verification,
    exports,
    settings as settings_route
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("webxray.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database tables and storage dirs
    logger.info("Initializing WebX-Ray AI Database and storage...")
    await init_db()
    settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    yield
    # Shutdown: Close browser engine
    logger.info("Closing browser engine...")
    await browser_engine.close()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production-grade Website Intelligence & AI Reconstruction Platform",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure storage directory exists before mounting StaticFiles
settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/storage", StaticFiles(directory=str(settings.STORAGE_DIR)), name="storage")

# Health Check
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "headless_browser": settings.HEADLESS_BROWSER
    }

# Register API Routers
app.include_router(projects.router, prefix="/api")
app.include_router(scans.router, prefix="/api")
app.include_router(pages.router, prefix="/api")
app.include_router(components.router, prefix="/api")
app.include_router(design_system.router, prefix="/api")
app.include_router(assets.router, prefix="/api")
app.include_router(network.router, prefix="/api")
app.include_router(backend_analysis.router, prefix="/api")
app.include_router(database_analysis.router, prefix="/api")
app.include_router(ai_analysis.router, prefix="/api")
app.include_router(blueprints.router, prefix="/api")
app.include_router(verification.router, prefix="/api")
app.include_router(exports.router, prefix="/api")
app.include_router(settings_route.router, prefix="/api")
