"""
FastAPI Application Entry Point
Professional Portfolio Website Backend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os
from dotenv import load_dotenv

from app.api import notes, quotes, contact
from app.services.cache_service import cache_service

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if os.getenv("DEBUG", "false").lower() == "true" else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting Portfolio Backend...")
    
    # Pre-warm disabled - notes will be parsed on first request
    # This allows the server to start quickly
    # try:
    #     from app.services.obsidian_parser import get_parser
    #     parser = get_parser()
    #     notes_data = parser.parse_all_notes()
    #     cache_service.set("all_notes", notes_data)
    #     logger.info(f"Cached {len(notes_data)} notes on startup")
    # except Exception as e:
    #     logger.warning(f"Could not pre-warm cache: {e}")
    logger.info("Server starting without cache pre-warming")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Portfolio Backend...")


# Create FastAPI application
app = FastAPI(
    title="Francesco Cavina Portfolio API",
    description="Backend API for personal portfolio website",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(notes.router, prefix="/api/notes", tags=["Notes"])
app.include_router(quotes.router, prefix="/api/quotes", tags=["Quotes"])
app.include_router(contact.router, prefix="/api/contact", tags=["Contact"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Francesco Cavina Portfolio API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
