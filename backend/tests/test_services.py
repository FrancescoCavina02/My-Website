"""
Unit tests for backend services.
Tests cache service, Obsidian parser, and quote service.
"""

import time
from datetime import datetime
from pathlib import Path

import pytest


@pytest.mark.unit
class TestCacheService:
    """Tests for caching functionality"""

    def test_cache_set_and_get(self):
        """Test setting and retrieving cached values"""
        from app.services.cache_service import CacheService

        cache = CacheService(default_ttl=60)

        # Set a value
        cache.set("test_key", "test_value")

        # Retrieve it
        value = cache.get("test_key")
        assert value == "test_value"

    def test_cache_get_nonexistent_key(self):
        """Test retrieving non-existent key returns None"""
        from app.services.cache_service import CacheService

        cache = CacheService(default_ttl=60)
        value = cache.get("nonexistent_key")

        assert value is None

    def test_cache_expiration(self):
        """Test that cached values expire after TTL"""
        from app.services.cache_service import CacheService

        # Very short TTL for testing
        cache = CacheService(default_ttl=1)

        cache.set("short_lived", "value")

        # Should exist immediately
        assert cache.get("short_lived") == "value"

        # Wait for expiration
        time.sleep(1.1)

        # Should be expired
        assert cache.get("short_lived") is None

    def test_cache_custom_ttl(self):
        """Test setting custom TTL for specific keys"""
        from app.services.cache_service import CacheService

        cache = CacheService(default_ttl=60)

        # Set with custom TTL
        cache.set("custom_ttl", "value", ttl=2)

        assert cache.get("custom_ttl") == "value"

        # Wait for expiration
        time.sleep(2.1)

        assert cache.get("custom_ttl") is None

    def test_cache_invalidate_single_key(self):
        """Test invalidating a single cache key"""
        from app.services.cache_service import CacheService

        cache = CacheService(default_ttl=60)

        cache.set("key1", "value1")
        cache.set("key2", "value2")

        # Invalidate one key
        cache.invalidate("key1")

        assert cache.get("key1") is None
        assert cache.get("key2") == "value2"

    def test_cache_invalidate_all(self):
        """Test clearing entire cache"""
        from app.services.cache_service import CacheService

        cache = CacheService(default_ttl=60)

        cache.set("key1", "value1")
        cache.set("key2", "value2")
        cache.set("key3", "value3")

        # Invalidate all
        count = cache.invalidate_all()

        assert count == 3
        assert cache.get("key1") is None
        assert cache.get("key2") is None
        assert cache.get("key3") is None

    def test_cache_overwrite_existing_key(self):
        """Test that setting same key overwrites previous value"""
        from app.services.cache_service import CacheService

        cache = CacheService(default_ttl=60)

        cache.set("key", "value1")
        assert cache.get("key") == "value1"

        cache.set("key", "value2")
        assert cache.get("key") == "value2"

    def test_cache_complex_objects(self):
        """Test caching complex Python objects"""
        from app.services.cache_service import CacheService

        cache = CacheService(default_ttl=60)

        # Cache a list
        cache.set("list", [1, 2, 3, {"nested": "dict"}])
        assert cache.get("list") == [1, 2, 3, {"nested": "dict"}]

        # Cache a dict
        cache.set("dict", {"key": "value", "nested": [1, 2, 3]})
        assert cache.get("dict") == {"key": "value", "nested": [1, 2, 3]}

    def test_cache_singleton_behavior(self):
        """Test that cache service acts as singleton"""
        from app.services.cache_service import CacheService, cache_service

        # Get the singleton instance
        cache1 = cache_service
        cache2 = cache_service

        # Should be same instance
        assert cache1 is cache2

        # Setting value in one should reflect in other
        cache1.set("singleton_test", "value")
        assert cache2.get("singleton_test") == "value"


@pytest.mark.unit
class TestObsidianParser:
    """Tests for Obsidian vault parsing"""

    def test_parser_initialization(self, mock_vault: Path):
        """Test parser initializes with valid vault path"""
        from app.services.obsidian_parser import ObsidianParser

        parser = ObsidianParser(str(mock_vault))
        assert parser.vault_path == mock_vault

    def test_parse_all_notes(self, mock_vault: Path):
        """Test parsing all notes from vault"""
        from app.services.obsidian_parser import ObsidianParser

        parser = ObsidianParser(str(mock_vault))
        notes = parser.parse_all_notes()

        # Should find our test notes
        assert isinstance(notes, list)
        assert len(notes) >= 3  # Python Basics, FastAPI Guide, Stoicism

        # Verify note structure
        note = notes[0]
        assert "id" in note
        assert "title" in note
        assert "content" in note
        assert "path" in note
        assert "tags" in note

    def test_parse_note_titles(self, mock_vault: Path):
        """Test that note titles are extracted correctly"""
        from app.services.obsidian_parser import ObsidianParser

        parser = ObsidianParser(str(mock_vault))
        notes = parser.parse_all_notes()

        titles = [note["title"] for note in notes]

        assert "Python Basics" in titles
        assert "FastAPI Guide" in titles
        assert "Stoicism" in titles

    def test_parse_note_tags(self, mock_vault: Path):
        """Test that tags are extracted from notes"""
        from app.services.obsidian_parser import ObsidianParser

        parser = ObsidianParser(str(mock_vault))
        notes = parser.parse_all_notes()

        # Find Python Basics note
        python_note = next((n for n in notes if n["title"] == "Python Basics"), None)
        assert python_note is not None

        # Should have tags
        tags = python_note["tags"]
        assert "programming" in tags
        assert "python" in tags

    def test_parse_note_content(self, mock_vault: Path):
        """Test that note content is parsed correctly"""
        from app.services.obsidian_parser import ObsidianParser

        parser = ObsidianParser(str(mock_vault))
        notes = parser.parse_all_notes()

        # Find Stoicism note
        stoic_note = next((n for n in notes if n["title"] == "Stoicism"), None)
        assert stoic_note is not None

        content = stoic_note["content"]
        assert "ancient Greek philosophy" in content
        assert "Marcus Aurelius" in content

    def test_search_notes(self, mock_vault: Path):
        """Test searching notes by query"""
        from app.services.obsidian_parser import ObsidianParser

        parser = ObsidianParser(str(mock_vault))
        notes = parser.parse_all_notes()

        # Search for 'fastapi'
        results = parser.search_notes("fastapi", notes)

        assert len(results) > 0
        assert any("FastAPI" in note["title"] for note in results)

    def test_search_case_insensitive(self, mock_vault: Path):
        """Test search is case insensitive"""
        from app.services.obsidian_parser import ObsidianParser

        parser = ObsidianParser(str(mock_vault))
        notes = parser.parse_all_notes()

        results_lower = parser.search_notes("python", notes)
        results_upper = parser.search_notes("PYTHON", notes)
        results_mixed = parser.search_notes("Python", notes)

        assert len(results_lower) == len(results_upper) == len(results_mixed)

    def test_get_note_by_id(self, mock_vault: Path):
        """Test retrieving specific note by ID"""
        from app.services.obsidian_parser import ObsidianParser

        parser = ObsidianParser(str(mock_vault))
        notes = parser.parse_all_notes()

        # Get first note's ID
        note_id = notes[0]["id"]

        # Retrieve by ID
        note = parser.get_note_by_id(note_id, notes)

        assert note is not None
        assert note["id"] == note_id

    def test_get_note_by_invalid_id(self, mock_vault: Path):
        """Test getting non-existent note returns None"""
        from app.services.obsidian_parser import ObsidianParser

        parser = ObsidianParser(str(mock_vault))
        notes = parser.parse_all_notes()

        note = parser.get_note_by_id("nonexistent-id", notes)

        assert note is None

    def test_parse_markdown_headings(self, mock_vault: Path):
        """Test extraction of markdown headings"""
        from app.services.obsidian_parser import ObsidianParser

        parser = ObsidianParser(str(mock_vault))
        notes = parser.parse_all_notes()

        # FastAPI note has multiple headings
        fastapi_note = next((n for n in notes if n["title"] == "FastAPI Guide"), None)
        assert fastapi_note is not None

        content = fastapi_note["content"]
        assert "Key Features" in content
        assert "Example Endpoint" in content

    def test_parse_code_blocks(self, mock_vault: Path):
        """Test that code blocks are preserved in content"""
        from app.services.obsidian_parser import ObsidianParser

        parser = ObsidianParser(str(mock_vault))
        notes = parser.parse_all_notes()

        # Python Basics has code block
        python_note = next((n for n in notes if n["title"] == "Python Basics"), None)
        assert python_note is not None

        content = python_note["content"]
        assert "def hello_world" in content or "hello_world" in content

    def test_ignore_non_markdown_files(self, mock_vault: Path):
        """Test that non-markdown files are ignored"""
        # Create a non-markdown file
        (mock_vault / "test.txt").write_text("Not markdown")
        (mock_vault / "image.png").write_text("Binary data")

        from app.services.obsidian_parser import ObsidianParser

        parser = ObsidianParser(str(mock_vault))
        notes = parser.parse_all_notes()

        # Should only have .md files
        for note in notes:
            assert note["path"].endswith(".md")


@pytest.mark.unit
class TestTreeParser:
    """Tests for folder tree structure parsing"""

    def test_parse_tree_structure(self, mock_vault: Path):
        """Test parsing vault into tree structure"""
        from app.services.tree_parser import TreeParser

        parser = TreeParser(str(mock_vault))
        tree = parser.parse_tree()

        assert isinstance(tree, list)
        assert len(tree) > 0

    def test_tree_contains_folders(self, mock_vault: Path):
        """Test tree includes folders"""
        from app.services.tree_parser import TreeParser

        parser = TreeParser(str(mock_vault))
        tree = parser.parse_tree()

        folder_names = [node["name"] for node in tree if node["type"] == "folder"]

        assert "Programming" in folder_names
        assert "Philosophy" in folder_names

    def test_tree_contains_files(self, mock_vault: Path):
        """Test tree includes files"""
        from app.services.tree_parser import TreeParser

        parser = TreeParser(str(mock_vault))
        tree = parser.parse_tree()

        # Should have quotes.md at root level
        file_names = [node["name"] for node in tree if node["type"] == "file"]
        assert any("quotes" in name.lower() for name in file_names)

    def test_tree_nested_structure(self, mock_vault: Path):
        """Test tree represents nested folders correctly"""
        from app.services.tree_parser import TreeParser

        parser = TreeParser(str(mock_vault))
        tree = parser.parse_tree()

        # Find Programming folder
        programming = next((n for n in tree if n["name"] == "Programming"), None)
        assert programming is not None
        assert programming["type"] == "folder"

        # Should have children
        if "children" in programming:
            assert len(programming["children"]) >= 2  # Python Basics, FastAPI Guide


@pytest.mark.unit
class TestQuoteService:
    """Tests for quote extraction and parsing"""

    def test_quote_service_initialization(self, mock_vault: Path):
        """Test quote service initializes correctly"""
        from app.services.quote_service import QuoteService

        service = QuoteService(str(mock_vault))
        assert service.vault_path == str(mock_vault)

    def test_extract_all_quotes(self, mock_vault: Path):
        """Test extracting all quotes from vault"""
        from app.services.quote_service import QuoteService

        service = QuoteService(str(mock_vault))
        quotes = service.get_all_quotes()

        # Should find quotes from quotes.md
        assert isinstance(quotes, list)
        assert len(quotes) >= 3  # We have 3 quotes in mock vault

        # Verify quote structure
        quote = quotes[0]
        assert "text" in quote
        assert "author" in quote

    def test_quote_authors(self, mock_vault: Path):
        """Test that authors are extracted correctly"""
        from app.services.quote_service import QuoteService

        service = QuoteService(str(mock_vault))
        quotes = service.get_all_quotes()

        authors = [quote["author"] for quote in quotes]

        # Should have Marcus Aurelius and Seneca
        assert "Marcus Aurelius" in authors
        assert "Seneca" in authors

    def test_quote_text_content(self, mock_vault: Path):
        """Test that quote text is extracted correctly"""
        from app.services.quote_service import QuoteService

        service = QuoteService(str(mock_vault))
        quotes = service.get_all_quotes()

        # Find Marcus Aurelius quote
        marcus_quotes = [q for q in quotes if q["author"] == "Marcus Aurelius"]
        assert len(marcus_quotes) > 0

        # Check for expected text
        texts = [q["text"] for q in marcus_quotes]
        quote_texts = " ".join(texts)
        assert "obstacle" in quote_texts.lower() or "death" in quote_texts.lower()

    def test_get_random_quote(self, mock_vault: Path):
        """Test getting a random quote"""
        from app.services.quote_service import QuoteService

        service = QuoteService(str(mock_vault))
        quote = service.get_random_quote()

        assert quote is not None
        assert "text" in quote
        assert "author" in quote
        assert len(quote["text"]) > 0

    def test_random_quote_varies(self, mock_vault: Path):
        """Test that random quotes vary"""
        from app.services.quote_service import QuoteService

        service = QuoteService(str(mock_vault))

        quotes = []
        for _ in range(10):
            quote = service.get_random_quote()
            quotes.append(quote["text"])

        # Should have at least 2 different quotes
        unique_quotes = set(quotes)
        assert len(unique_quotes) >= 1

    def test_quote_text_cleanup(self, mock_vault: Path):
        """Test that quote text doesn't contain markdown artifacts"""
        from app.services.quote_service import QuoteService

        service = QuoteService(str(mock_vault))
        quotes = service.get_all_quotes()

        for quote in quotes:
            # Should not have blockquote markers
            assert not quote["text"].startswith(">")

            # Should not have em-dash in text (only in author attribution)
            assert not quote["text"].startswith("—")

            # Author should not have > or other markdown
            assert ">" not in quote["author"]

    def test_empty_vault_quotes(self, tmp_path):
        """Test handling of vault with no quotes"""
        from app.services.quote_service import QuoteService

        # Create empty vault
        empty_vault = tmp_path / "empty_vault"
        empty_vault.mkdir()

        service = QuoteService(str(empty_vault))
        quotes = service.get_all_quotes()

        # Should return empty list, not crash
        assert isinstance(quotes, list)
        assert len(quotes) == 0

        # Random quote should return None or handle gracefully
        random_quote = service.get_random_quote()
        assert random_quote is None or isinstance(random_quote, dict)


@pytest.mark.unit
class TestServiceIntegration:
    """Integration tests for services working together"""

    def test_cache_with_parser(self, mock_vault: Path):
        """Test caching parser results"""
        from app.services.cache_service import CacheService
        from app.services.obsidian_parser import ObsidianParser

        cache = CacheService(default_ttl=60)
        parser = ObsidianParser(str(mock_vault))

        # Parse and cache
        notes = parser.parse_all_notes()
        cache.set("all_notes", notes)

        # Retrieve from cache
        cached_notes = cache.get("all_notes")

        assert cached_notes == notes
        assert len(cached_notes) == len(notes)

    def test_cache_with_quotes(self, mock_vault: Path):
        """Test caching quote service results"""
        from app.services.cache_service import CacheService
        from app.services.quote_service import QuoteService

        cache = CacheService(default_ttl=60)
        service = QuoteService(str(mock_vault))

        # Get quotes and cache
        quotes = service.get_all_quotes()
        cache.set("all_quotes", quotes)

        # Retrieve from cache
        cached_quotes = cache.get("all_quotes")

        assert cached_quotes == quotes
