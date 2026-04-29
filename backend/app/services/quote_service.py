"""
Quote Service
Extract and serve inspirational quotes from Obsidian vault
"""

import logging
import random
import re
from typing import List, Optional

from app.models.note import Note, Quote
from app.services.cache_service import cache_service
from app.services.obsidian_parser import get_parser

logger = logging.getLogger(__name__)


class QuoteService:
    """Service for extracting and serving quotes from notes"""

    # Patterns that indicate quote-worthy content
    QUOTE_PATTERNS = [
        r"^>\s*(.+)$",  # Blockquotes
        r'"([^"]{20,200})"',  # Quoted text
        r"'([^']{20,200})'",  # Single-quoted text
    ]

    # Minimum/maximum quote lengths
    MIN_QUOTE_LENGTH = 30
    MAX_QUOTE_LENGTH = 500

    def __init__(self):
        """Initialize quote service"""
        self._compiled_patterns = [re.compile(p, re.MULTILINE) for p in self.QUOTE_PATTERNS]

    def is_valid_quote(self, text: str, note: Note) -> bool:
        """Apply comprehensive quality filter to reject bad quotes."""
        # 1. LaTeX / Math rejection
        latex_keywords = [
            r"\frac", r"\sqrt", r"\int", r"\sum", r"\prod", r"\partial", r"\nabla",
            r"\cdot", r"\times", r"\alpha", r"\beta", r"\gamma", r"\theta", r"\lambda",
            r"\sigma", r"\pi", r"\infty", r"\approx", r"\leq", r"\geq", r"\neq", r"\equiv"
        ]
        if any(kw in text for kw in latex_keywords):
            return False
        if "$" in text or r"\\" in text:
            return False
        if re.search(r"[a-zA-Z]\s*=\s*[a-zA-Z0-9\\]", text):
            return False

        # 2. Markdown syntax rejection
        if text.startswith("#"):
            return False
        if "**" in text or "__" in text:
            return False
        if "---" in text or "===" in text:
            return False
        if text.count("|") > 1:
            return False
        if "![[" in text:
            return False
        if re.match(r"^\s*-\s", text):
            return False

        # 3. Code / technical content rejection
        if "`" in text:
            return False
        if "{" in text and "}" in text:
            return False
        code_keywords = ["import ", "def ", "class ", "return ", "const ", "function "]
        if any(kw in text for kw in code_keywords):
            return False
        if "://" in text:
            return False
        if text.startswith("/") or text.startswith("./"):
            return False

        # 4. Low linguistic quality rejection
        # a) Special character ratio
        special_chars = sum(1 for c in text if not c.isalnum() and not c.isspace() and c not in ",.'-:;!?\"")
        if len(text) > 0 and special_chars / len(text) > 0.10:
            return False

        # b) Word count floor
        words = text.strip().split()
        if len(words) < 6:
            return False

        # c) Word count ceiling
        if len(words) > 80:
            return False

        # d) Capitalization check
        first_char = next((c for c in text if not c.isspace()), "")
        if not first_char.isalpha() or not first_char.isupper():
            return False

        # e) Sentence completeness heuristic
        if not text.endswith((".", "!", "?", '"', "'", "…")):
            return False

        # f) Numeric dominance
        digits = sum(1 for c in text if c.isdigit())
        if len(text) > 0 and digits / len(text) > 0.20:
            return False

        # g) Repetition check
        word_counts = {}
        for w in words:
            clean_word = "".join(c.lower() for c in w if c.isalpha())
            if clean_word:
                word_counts[clean_word] = word_counts.get(clean_word, 0) + 1
                if word_counts[clean_word] > 4:
                    return False

        # 5. Source-context validity
        if note.category == "Mathematics" and ("=" in text or any(op in text for op in "+-*/")):
            if len(words) < 15:
                return False

        return True

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
                if text.startswith("http") or "```" in text or "[[" in text:
                    continue

                # NEW: apply comprehensive quality filter
                if not self.is_valid_quote(text, note):
                    continue

                quotes.append(
                    Quote(text=text, source=note.title, book=note.book, category=note.category)
                )

        logger.debug(
            f"Note '{note.title}': {len(quotes)} valid quotes extracted"
        )
        return quotes

    def get_all_quotes(self) -> List[Quote]:
        """
        Get all quotes from the vault

        Returns:
            List of all extracted quotes
        """
        # Check cache
        QUOTE_CACHE_KEY = "all_quotes_v2"
        cached = cache_service.get(QUOTE_CACHE_KEY)
        if cached is not None:
            return cached

        parser = get_parser()
        notes = parser.parse_all_notes()

        all_quotes = []
        for note in notes:
            quotes = self.extract_quotes_from_note(note)
            all_quotes.extend(quotes)

        logger.info(
            f"Extracted {len(all_quotes)} valid quotes from {len(notes)} notes"
        )

        # Cache the results
        cache_service.set(QUOTE_CACHE_KEY, all_quotes)

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
