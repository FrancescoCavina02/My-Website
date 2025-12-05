"""
Notes API Routes
Endpoints for browsing and searching Obsidian notes
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import logging

from app.models.note import Note, NoteMetadata, NoteTree, NoteStats
from app.services.obsidian_parser import get_parser
from app.services.tree_parser import get_tree_parser
from app.services.cache_service import cache_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=List[NoteMetadata])
async def get_all_notes(
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(100, ge=1, le=500)
) -> List[NoteMetadata]:
    """
    Get all notes metadata (without full content)
    
    Args:
        category: Optional category filter
        limit: Maximum number of notes to return
    """
    parser = get_parser()
    notes = parser.parse_all_notes()
    
    if category:
        notes = [n for n in notes if n.category.lower() == category.lower()]
    
    # Convert to metadata (without full content)
    metadata = [
        NoteMetadata(
            id=n.id,
            title=n.title,
            category=n.category,
            book=n.book,
            file_path=n.file_path,
            word_count=n.word_count
        )
        for n in notes[:limit]
    ]
    
    return metadata


@router.get("/stats", response_model=NoteStats)
async def get_stats() -> NoteStats:
    """Get statistics about the note collection"""
    parser = get_parser()
    stats = parser.get_statistics()
    return NoteStats(**stats)


@router.get("/categories")
async def get_categories() -> List[str]:
    """Get all unique categories"""
    parser = get_parser()
    stats = parser.get_statistics()
    return list(stats.get("categories", {}).keys())


@router.get("/tree")
async def get_note_tree() -> dict:
    """
    Get hierarchical tree structure for all notes
    
    Returns organized trees by category
    """
    # Check cache
    cached = cache_service.get("note_tree")
    if cached:
        return cached
    
    parser = get_parser()
    tree_parser = get_tree_parser()
    
    notes = parser.parse_all_notes()
    trees = tree_parser.build_category_tree(notes)
    
    # Convert to dict for JSON serialization
    result = {
        category: [tree.model_dump() for tree in category_trees]
        for category, category_trees in trees.items()
    }
    
    cache_service.set("note_tree", result)
    return result


@router.get("/search")
async def search_notes(
    q: str = Query(..., min_length=2, description="Search query"),
    limit: int = Query(20, ge=1, le=50)
) -> List[NoteMetadata]:
    """
    Search notes by title or content
    
    Args:
        q: Search query (minimum 2 characters)
        limit: Maximum results to return
    """
    parser = get_parser()
    results = parser.search_notes(q)
    
    metadata = [
        NoteMetadata(
            id=n.id,
            title=n.title,
            category=n.category,
            book=n.book,
            file_path=n.file_path,
            word_count=n.word_count
        )
        for n in results[:limit]
    ]
    
    return metadata


@router.get("/{note_id}", response_model=Note)
async def get_note(note_id: str) -> Note:
    """
    Get a single note by ID (includes full content)
    
    Args:
        note_id: The note's unique identifier
    """
    parser = get_parser()
    note = parser.get_note_by_id(note_id)
    
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    return note


@router.post("/cache/invalidate")
async def invalidate_cache():
    """Force refresh of the notes cache"""
    count = cache_service.invalidate_all()
    return {"message": f"Cache invalidated, {count} entries cleared"}
