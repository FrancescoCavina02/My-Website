"""
FastAPI Application Entry Point
Professional Portfolio Website Backend
"""

import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api import auth, contact, notes, quotes
from app.config import get_settings
from app.logging_config import configure_logging, get_logger
from app.middleware.rate_limit import limiter
from app.middleware.request_id import RequestIDMiddleware
from app.middleware.security import SecurityHeadersMiddleware
from app.services.file_watcher import initialize_file_watcher, shutdown_file_watcher
from app.services.obsidian_parser import get_parser
from app.services.tree_parser import get_tree_parser
from app.services.cache_service import cache_service

# Load environment variables
load_dotenv()

# Validate environment variables on startup
# This will fail fast if required variables are missing or invalid
try:
    settings = get_settings()
except Exception as e:
    # Logger may not be configured yet, use print for critical startup errors
    print(f"FATAL: Failed to load configuration: {e}")
    raise SystemExit(1)

# Configure structured logging
configure_logging(debug=settings.debug)
logger = get_logger(__name__)
logger.info("startup", message="Environment variables validated successfully", debug=settings.debug)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    logger.info("startup", message="Starting Portfolio Backend")

    # Start file watcher
    try:
        if settings.obsidian_vault_path and os.path.exists(settings.obsidian_vault_path):
            initialize_file_watcher(settings.obsidian_vault_path)
            logger.info("file_watcher_started", vault_path=settings.obsidian_vault_path)
        else:
            logger.warning("vault_path_missing", vault_path=settings.obsidian_vault_path)
    except Exception as e:
        logger.warning("file_watcher_failed", error=str(e), exc_info=True)

    # Pre-warm cache so first request is instant
    try:
        parser = get_parser()
        all_notes = parser.parse_all_notes()
        tree_parser = get_tree_parser()
        structure = tree_parser.build_category_structure(all_notes)
        cache_service.set("full_structure", structure)
        logger.info("startup_complete", cache_prewarming="enabled")
    except Exception as e:
        logger.error("cache_prewarm_failed", error=str(e), exc_info=True)
        logger.info("startup_complete", cache_prewarming="failed")

    yield

    # Shutdown
    logger.info("shutdown", message="Shutting down Portfolio Backend")
    try:
        shutdown_file_watcher()
        logger.info("file_watcher_stopped")
    except Exception as e:
        logger.error("file_watcher_shutdown_failed", error=str(e), exc_info=True)


# Create FastAPI application
app = FastAPI(
    title="Francesco Cavina Portfolio API",
    description="Backend API for personal portfolio website",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add middleware (order matters - first added is outermost)
app.add_middleware(RequestIDMiddleware)  # Add request ID to all requests
app.add_middleware(SecurityHeadersMiddleware)  # Add security headers

# Configure CORS - tightened for security
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins_list(),
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # Only allow necessary methods
    allow_headers=["Content-Type", "Authorization"],  # Only allow necessary headers
)

# Register API routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(notes.router, prefix="/api/notes", tags=["Notes"])
app.include_router(quotes.router, prefix="/api/quotes", tags=["Quotes"])
app.include_router(contact.router, prefix="/api/contact", tags=["Contact"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Francesco Cavina Portfolio API", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
