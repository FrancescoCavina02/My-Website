"""
Quote Service
Extract and serve inspirational quotes from Obsidian vault
"""

import re
import random
from typing import List, Dict, Optional
import logging

from app.models.note import Note, Quote
from app.services.obsidian_parser import get_parser
from app.services.cache_service import cache_service

logger = logging.getLogger(__name__)


class QuoteService:
    """Service for extracting and serving quotes from notes"""
    
    # Patterns that indicate quote-worthy content
    QUOTE_PATTERNS = [
        r'^>\s*(.+)$',  # Blockquotes
        r'"([^"]{20,200})"',  # Quoted text
        r"'([^']{20,200})'",  # Single-quoted text
    ]
    
    # Minimum/maximum quote lengths
    MIN_QUOTE_LENGTH = 30
    MAX_QUOTE_LENGTH = 500
    
    def __init__(self):
        """Initialize quote service"""
        self._compiled_patterns = [re.compile(p, re.MULTILINE) for p in self.QUOTE_PATTERNS]
    
    def extract_quotes_from_note(self, note: Note) -> List[Quote]:
        """
        Extract notable quotes from a single note
        
        Args:
            note: Note to extract quotes from
            
        Returns:
            List of Quote objects
        """
        quotes = []
        
        # Try each pattern
        for pattern in self._compiled_patterns:
            matches = pattern.findall(note.content)
            
            for match in matches:
                text = match.strip()
                
                # Validate length
                if len(text) < self.MIN_QUOTE_LENGTH or len(text) > self.MAX_QUOTE_LENGTH:
                    continue
                
                # Skip if it looks like code or a link
                if text.startswith('http') or '```' in text or '[[' in text:
                    continue
                
                quotes.append(Quote(
                    text=text,
                    source=note.title,
                    book=note.book,
                    category=note.category
                ))
        
        return quotes
    
    def get_all_quotes(self) -> List[Quote]:
        """
        Get all quotes from the vault
        
        Returns:
            List of all extracted quotes
        """
        # Check cache
        cached = cache_service.get("all_quotes")
        if cached is not None:
            return cached
        
        parser = get_parser()
        notes = parser.parse_all_notes()
        
        all_quotes = []
        for note in notes:
            quotes = self.extract_quotes_from_note(note)
            all_quotes.extend(quotes)
        
        logger.info(f"Extracted {len(all_quotes)} quotes from {len(notes)} notes")
        
        # Cache the results
        cache_service.set("all_quotes", all_quotes)
        
        return all_quotes
    
    def get_categories(self) -> List[str]:
        """
        Get all unique quote categories
        
        Returns:
            List of category names
        """
        quotes = self.get_all_quotes()
        categories = list(set(q.category for q in quotes))
        return sorted(categories)
    
    def get_random_quote(self, category: Optional[str] = None) -> Optional[Quote]:
        """
        Get a random quote, optionally filtered by category
        
        Args:
            category: Category to filter by (optional)
            
        Returns:
            Random Quote or None if no quotes available
        """
        quotes = self.get_all_quotes()
        
        if category:
            quotes = [q for q in quotes if q.category.lower() == category.lower()]
        
        if not quotes:
            return None
        
        return random.choice(quotes)
    
    def get_quotes_by_category(self, category: str) -> List[Quote]:
        """
        Get all quotes in a specific category
        
        Args:
            category: Category name
            
        Returns:
            List of quotes in the category
        """
        quotes = self.get_all_quotes()
        return [q for q in quotes if q.category.lower() == category.lower()]


# Global instance
_quote_service: Optional[QuoteService] = None


def get_quote_service() -> QuoteService:
    """Get or create the global quote service instance"""
    global _quote_service
    if _quote_service is None:
        _quote_service = QuoteService()
    return _quote_service
