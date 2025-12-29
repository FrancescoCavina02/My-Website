"""
Notes API Routes
Endpoints for browsing and searching Obsidian notes
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import logging

from app.models.note import Note, NoteMetadata, NoteStats
from app.services.obsidian_parser import get_parser
from app.services.tree_parser import get_tree_parser
from app.services.cache_service import cache_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=List[NoteMetadata])
async def get_all_notes(
    category: Optional[str] = Query(None, description="Filter by category"),
    book: Optional[str] = Query(None, description="Filter by book"),
    limit: int = Query(100, ge=1, le=500)
) -> List[NoteMetadata]:
    """Get all notes metadata (without full content)"""
    parser = get_parser()
    notes = parser.parse_all_notes()
    
    if category:
        notes = [n for n in notes if n.category.lower() == category.lower()]
    if book:
        notes = [n for n in notes if n.book and n.book.lower() == book.lower()]
    
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
    return parser.get_categories()


@router.get("/books")
async def get_books(category: Optional[str] = None) -> List[str]:
    """Get all books, optionally filtered by category"""
    parser = get_parser()
    if category:
        return parser.get_books_by_category(category)
    
    stats = parser.get_statistics()
    return list(stats.get("books", {}).keys())


@router.get("/structure")
async def get_structure():
    """
    Get full hierarchical structure organized by category -> book -> tree
    
    This is the main endpoint for the Notes page grid view
    """
    cached = cache_service.get("full_structure")
    if cached:
        return cached
    
    parser = get_parser()
    tree_parser = get_tree_parser()
    
    notes = parser.parse_all_notes()
    structure = tree_parser.build_category_structure(notes)
    
    cache_service.set("full_structure", structure)
    return structure


@router.get("/tree/{book}")
async def get_book_tree(book: str):
    """Get tree structure for a specific book"""
    parser = get_parser()
    tree_parser = get_tree_parser()
    
    notes = parser.parse_all_notes()
    book_notes = [n for n in notes if n.book and n.book.lower() == book.lower()]
    
    if not book_notes:
        raise HTTPException(status_code=404, detail=f"Book not found: {book}")
    
    root_notes = tree_parser.find_root_notes(book_notes)
    
    if not root_notes:
        # No root note found, return flat list
        return {
            "book": book,
            "has_tree": False,
            "notes": [
                {"id": n.id, "title": n.title}
                for n in book_notes
            ]
        }
    
    # Build tree from first root note
    tree = tree_parser.build_tree(root_notes[0], notes)
    
    return {
        "book": book,
        "has_tree": True,
        "tree": tree.to_dict()
    }


@router.get("/search")
async def search_notes(
    q: str = Query(..., min_length=2, description="Search query"),
    limit: int = Query(20, ge=1, le=50)
) -> List[NoteMetadata]:
    """Search notes by title or content"""
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


@router.get("/{note_id}")
async def get_note(note_id: str):
    """Get a single note by ID (includes full content and navigation context)"""
    parser = get_parser()
    tree_parser = get_tree_parser()
    
    note = parser.get_note_by_id(note_id)
    
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    # Try to get navigation context if note is part of a book tree
    navigation = None
    if note.book:
        notes = parser.parse_all_notes()
        book_notes = [n for n in notes if n.book == note.book]
        root_notes = tree_parser.find_root_notes(book_notes)
        
        for root_note in root_notes:
            tree = tree_parser.build_tree(root_note, notes)
            nav = tree_parser.get_navigation_context(note, tree)
            if nav.get("breadcrumbs"):
                navigation = nav
                break
    
    return {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "category": note.category,
        "book": note.book,
        "file_path": note.file_path,
        "links": note.links,
        "word_count": note.word_count,
        "navigation": navigation
    }


@router.post("/cache/invalidate")
async def invalidate_cache():
    """Force refresh of the notes cache"""
    count = cache_service.invalidate_all()
    return {"message": f"Cache invalidated, {count} entries cleared"}
