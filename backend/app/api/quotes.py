"""
Quotes API Routes
Endpoints for the Daily Quotes feature
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import logging

from app.models.note import Quote
from app.services.quote_service import get_quote_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/categories", response_model=List[str])
async def get_quote_categories() -> List[str]:
    """
    Get all available quote categories
    
    Categories are derived dynamically from the Obsidian vault structure
    """
    service = get_quote_service()
    categories = service.get_categories()
    return categories


@router.get("/random", response_model=Quote)
async def get_random_quote(
    category: Optional[str] = Query(None, description="Filter by category")
) -> Quote:
    """
    Get a random inspirational quote
    
    Args:
        category: Optional category filter (e.g., "Spiritual", "Self-Help")
    """
    service = get_quote_service()
    quote = service.get_random_quote(category)
    
    if not quote:
        raise HTTPException(
            status_code=404,
            detail=f"No quotes found{' in category: ' + category if category else ''}"
        )
    
    return quote


@router.get("/", response_model=List[Quote])
async def get_quotes(
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(20, ge=1, le=100)
) -> List[Quote]:
    """
    Get quotes, optionally filtered by category
    
    Args:
        category: Optional category filter
        limit: Maximum number of quotes to return
    """
    service = get_quote_service()
    
    if category:
        quotes = service.get_quotes_by_category(category)
    else:
        quotes = service.get_all_quotes()
    
    return quotes[:limit]
