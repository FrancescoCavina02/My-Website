"""
Obsidian Vault Parser
Parses markdown files from Obsidian vault and extracts structured data
Adapted from NLP Chatbot project for portfolio use
"""

import re
import hashlib
from pathlib import Path
from typing import List, Optional, Tuple
import logging
from datetime import datetime
import os
from dotenv import load_dotenv

from app.models.note import Note
from app.services.cache_service import cache_service

load_dotenv()

logger = logging.getLogger(__name__)


class ObsidianParser:
    """Parse Obsidian vault markdown files"""
    
    def __init__(self, vault_path: Optional[str] = None):
        """
        Initialize parser with vault path
        
        Args:
            vault_path: Path to Obsidian vault root (uses env var if not provided)
        """
        self.vault_path = Path(vault_path or os.getenv("OBSIDIAN_VAULT_PATH", ""))
        
        if not self.vault_path.exists():
            logger.warning(f"Vault path does not exist: {self.vault_path}")
        else:
            logger.info(f"Initialized ObsidianParser for vault: {self.vault_path}")
    
    def parse_all_notes(self, exclude_patterns: Optional[List[str]] = None) -> List[Note]:
        """
        Parse all markdown files in the vault
        
        Args:
            exclude_patterns: List of patterns to exclude (e.g., ['.obsidian', 'templates'])
        
        Returns:
            List of parsed Note objects
        """
        # Check cache first
        cached = cache_service.get("all_notes")
        if cached is not None:
            return cached
        
        if exclude_patterns is None:
            exclude_patterns = ['.obsidian', 'templates', 'Archive', '.trash']
        
        notes = []
        
        if not self.vault_path.exists():
            logger.error(f"Vault path does not exist: {self.vault_path}")
            return notes
        
        markdown_files = list(self.vault_path.rglob("*.md"))
        logger.info(f"Found {len(markdown_files)} markdown files")
        
        for file_path in markdown_files:
            # Skip excluded paths
            if any(pattern in str(file_path) for pattern in exclude_patterns):
                continue
            
            try:
                note = self.parse_note(file_path)
                if note:
                    notes.append(note)
            except Exception as e:
                logger.error(f"Error parsing {file_path}: {e}")
                continue
        
        logger.info(f"Successfully parsed {len(notes)} notes")
        
        # Cache the results
        cache_service.set("all_notes", notes)
        
        return notes
    
    def parse_note(self, file_path: Path) -> Optional[Note]:
        """
        Parse a single markdown file
        
        Args:
            file_path: Path to markdown file
        
        Returns:
            Note object or None if parsing fails
        """
        try:
            content = file_path.read_text(encoding='utf-8')
            
            if not content.strip():
                return None
            
            # Extract title (use filename without extension)
            title = file_path.stem
            # Clean up title (remove "Notes - " prefix if present)
            if title.startswith("Notes - "):
                title = title[8:]
            
            # Extract metadata from file path
            relative_path = file_path.relative_to(self.vault_path)
            category = self._extract_category(relative_path)
            book = self._extract_book(relative_path)
            
            # Extract Obsidian links
            links = self._extract_links(content)
            
            # Count words
            word_count = len(content.split())
            
            # Generate unique ID
            note_id = self._generate_id(category, book, title)
            
            return Note(
                id=note_id,
                title=title,
                content=content,
                category=category,
                book=book,
                file_path=str(relative_path),
                links=links,
                word_count=word_count,
                created_at=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Failed to parse {file_path}: {e}")
            return None
    
    def get_note_by_id(self, note_id: str) -> Optional[Note]:
        """
        Get a specific note by its ID
        
        Args:
            note_id: The note's unique identifier
            
        Returns:
            Note object or None if not found
        """
        notes = self.parse_all_notes()
        for note in notes:
            if note.id == note_id:
                return note
        return None
    
    def get_notes_by_category(self, category: str) -> List[Note]:
        """
        Get all notes in a specific category
        
        Args:
            category: Category name to filter by
            
        Returns:
            List of notes in the category
        """
        notes = self.parse_all_notes()
        return [n for n in notes if n.category.lower() == category.lower()]
    
    def search_notes(self, query: str) -> List[Note]:
        """
        Search notes by title or content
        
        Args:
            query: Search query string
            
        Returns:
            List of matching notes
        """
        notes = self.parse_all_notes()
        query_lower = query.lower()
        
        results = []
        for note in notes:
            if (query_lower in note.title.lower() or 
                query_lower in note.content.lower()):
                results.append(note)
        
        return results
    
    def _extract_category(self, relative_path: Path) -> str:
        """Extract category from file path (top-level folder)"""
        parts = relative_path.parts
        if len(parts) > 0:
            return parts[0]
        return "General"
    
    def _extract_book(self, relative_path: Path) -> Optional[str]:
        """Extract book/source name from file path (second-level folder)"""
        parts = relative_path.parts
        if len(parts) >= 2:
            return parts[1]
        return None
    
    def _extract_links(self, content: str) -> List[str]:
        """Extract Obsidian wiki-style links [[Link Text]]"""
        pattern = r'\[\[([^\]|]+)(?:\|[^\]]+)?\]\]'
        matches = re.findall(pattern, content)
        
        seen = set()
        unique_links = []
        for link in matches:
            if link not in seen:
                seen.add(link)
                unique_links.append(link)
        
        return unique_links
    
    def _generate_id(self, category: str, book: Optional[str], title: str) -> str:
        """Generate a unique ID for a note"""
        parts = [
            self._slugify(category),
            self._slugify(book) if book else "",
            self._slugify(title)
        ]
        slug = "_".join(p for p in parts if p)
        
        if len(slug) > 100:
            hash_suffix = hashlib.md5(slug.encode()).hexdigest()[:8]
            slug = f"{slug[:80]}_{hash_suffix}"
        
        return slug
    
    @staticmethod
    def _slugify(text: str) -> str:
        """Convert text to URL-safe slug"""
        if not text:
            return ""
        
        text = text.lower()
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[-\s]+', '-', text)
        text = text.strip('-')
        
        return text
    
    def get_statistics(self) -> dict:
        """Get statistics about parsed notes"""
        notes = self.parse_all_notes()
        
        if not notes:
            return {
                "total_notes": 0,
                "categories": {},
                "books": {},
                "total_words": 0
            }
        
        categories = {}
        books = {}
        total_words = 0
        
        for note in notes:
            categories[note.category] = categories.get(note.category, 0) + 1
            if note.book:
                books[note.book] = books.get(note.book, 0) + 1
            total_words += note.word_count
        
        return {
            "total_notes": len(notes),
            "categories": dict(sorted(categories.items())),
            "books": dict(sorted(books.items())),
            "total_words": total_words,
            "avg_words_per_note": total_words // len(notes) if notes else 0
        }


# Global parser instance
_parser: Optional[ObsidianParser] = None


def get_parser() -> ObsidianParser:
    """Get or create the global parser instance"""
    global _parser
    if _parser is None:
        _parser = ObsidianParser()
    return _parser
