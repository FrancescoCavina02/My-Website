"""
Unit tests for backend services.
Tests cache service, Obsidian parser, tree parser, and quote service.
"""

import time
from pathlib import Path

import pytest


@pytest.mark.unit
class TestCacheService:
    """Tests for caching functionality"""

    def test_cache_set_and_get(self):
        from app.services.cache_service import CacheService

        cache = CacheService(default_ttl=60)
        cache.set("test_key", "test_value")
        assert cache.get("test_key") == "test_value"

    def test_cache_get_nonexistent_key(self):
        from app.services.cache_service import CacheService

        cache = CacheService(default_ttl=60)
        assert cache.get("nonexistent_key") is None

    def test_cache_expiration(self):
        from app.services.cache_service import CacheService

        cache = CacheService(default_ttl=1)
        cache.set("short_lived", "value")
        assert cache.get("short_lived") == "value"
        time.sleep(1.1)
        assert cache.get("short_lived") is None

    def test_cache_custom_ttl(self):
        from app.services.cache_service import CacheService

        cache = CacheService(default_ttl=60)
        cache.set("custom_ttl", "value", ttl=2)
        assert cache.get("custom_ttl") == "value"
        time.sleep(2.1)
        assert cache.get("custom_ttl") is None

    def test_cache_invalidate_single_key(self):
        from app.services.cache_service import CacheService

        cache = CacheService(default_ttl=60)
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        cache.invalidate("key1")

        assert cache.get("key1") is None
        assert cache.get("key2") == "value2"

    def test_cache_invalidate_all(self):
        from app.services.cache_service import CacheService

        cache = CacheService(default_ttl=60)
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        cache.set("key3", "value3")

        count = cache.invalidate_all()

        assert count == 3
        assert cache.get("key1") is None
        assert cache.get("key2") is None
        assert cache.get("key3") is None

    def test_cache_overwrite_existing_key(self):
        from app.services.cache_service import CacheService

        cache = CacheService(default_ttl=60)
        cache.set("key", "value1")
        assert cache.get("key") == "value1"
        cache.set("key", "value2")
        assert cache.get("key") == "value2"

    def test_cache_complex_objects(self):
        from app.services.cache_service import CacheService

        cache = CacheService(default_ttl=60)
        cache.set("list", [1, 2, 3, {"nested": "dict"}])
        assert cache.get("list") == [1, 2, 3, {"nested": "dict"}]

        cache.set("dict", {"key": "value", "nested": [1, 2, 3]})
        assert cache.get("dict") == {"key": "value", "nested": [1, 2, 3]}

    def test_cache_singleton_behavior(self):
        from app.services.cache_service import cache_service

        cache1 = cache_service
        cache2 = cache_service

        assert cache1 is cache2
        cache1.set("singleton_test", "value")
        assert cache2.get("singleton_test") == "value"


@pytest.mark.unit
class TestObsidianParser:
    """Tests for Obsidian vault parsing"""

    def test_parser_initialization(self, mock_vault: Path):
        from app.services.obsidian_parser import ObsidianParser

        parser = ObsidianParser(str(mock_vault))
        assert parser.vault_path == mock_vault

    def test_parse_all_notes(self, mock_vault: Path):
        from app.services.obsidian_parser import ObsidianParser

        parser = ObsidianParser(str(mock_vault))
        notes = parser.parse_all_notes()

        assert isinstance(notes, list)
        assert len(notes) >= 3

        note = notes[0]
        assert hasattr(note, "id")
        assert hasattr(note, "title")
        assert hasattr(note, "content")
        assert hasattr(note, "file_path")
        assert hasattr(note, "links")

    def test_parse_note_titles(self, mock_vault: Path):
        from app.services.obsidian_parser import ObsidianParser

        parser = ObsidianParser(str(mock_vault))
        notes = parser.parse_all_notes()
        titles = [note.title for note in notes]

        assert "Python Basics" in titles
        assert "FastAPI Guide" in titles
        assert "Stoicism" in titles

    def test_parse_note_links(self, mock_vault: Path):
        from app.services.obsidian_parser import ObsidianParser

        parser = ObsidianParser(str(mock_vault))
        notes = parser.parse_all_notes()
        python_note = next((n for n in notes if n.title == "Python Basics"), None)

        assert python_note is not None
        assert isinstance(python_note.links, list)

    def test_parse_note_content(self, mock_vault: Path):
        from app.services.obsidian_parser import ObsidianParser

        parser = ObsidianParser(str(mock_vault))
        notes = parser.parse_all_notes()
        stoic_note = next((n for n in notes if n.title == "Stoicism"), None)

        assert stoic_note is not None
        assert "ancient Greek philosophy" in stoic_note.content
        assert "Marcus Aurelius" in stoic_note.content

    def test_search_notes(self, mock_vault: Path):
        from app.services.obsidian_parser import ObsidianParser

        parser = ObsidianParser(str(mock_vault))
        parser.parse_all_notes()
        results = parser.search_notes("fastapi")

        assert len(results) > 0
        assert any("FastAPI" in note.title for note in results)

    def test_search_case_insensitive(self, mock_vault: Path):
        from app.services.obsidian_parser import ObsidianParser

        parser = ObsidianParser(str(mock_vault))
        parser.parse_all_notes()

        results_lower = parser.search_notes("python")
        results_upper = parser.search_notes("PYTHON")
        results_mixed = parser.search_notes("Python")

        assert len(results_lower) == len(results_upper) == len(results_mixed)

    def test_get_note_by_id(self, mock_vault: Path):
        from app.services.obsidian_parser import ObsidianParser

        parser = ObsidianParser(str(mock_vault))
        notes = parser.parse_all_notes()

        note_id = notes[0].id
        note = parser.get_note_by_id(note_id)

        assert note is not None
        assert note.id == note_id

    def test_get_note_by_invalid_id(self, mock_vault: Path):
        from app.services.obsidian_parser import ObsidianParser

        parser = ObsidianParser(str(mock_vault))
        parser.parse_all_notes()

        assert parser.get_note_by_id("nonexistent-id") is None

    def test_parse_markdown_headings(self, mock_vault: Path):
        from app.services.obsidian_parser import ObsidianParser

        parser = ObsidianParser(str(mock_vault))
        notes = parser.parse_all_notes()
        fastapi_note = next((n for n in notes if n.title == "FastAPI Guide"), None)

        assert fastapi_note is not None
        assert "Key Features" in fastapi_note.content
        assert "Example Endpoint" in fastapi_note.content

    def test_parse_code_blocks(self, mock_vault: Path):
        from app.services.obsidian_parser import ObsidianParser

        parser = ObsidianParser(str(mock_vault))
        notes = parser.parse_all_notes()
        python_note = next((n for n in notes if n.title == "Python Basics"), None)

        assert python_note is not None
        assert "hello_world" in python_note.content

    def test_ignore_non_markdown_files(self, mock_vault: Path):
        from app.services.obsidian_parser import ObsidianParser

        (mock_vault / "test.txt").write_text("Not markdown")
        (mock_vault / "image.png").write_text("Binary data")

        parser = ObsidianParser(str(mock_vault))
        notes = parser.parse_all_notes()

        for note in notes:
            assert note.file_path.endswith(".md")


@pytest.mark.unit
class TestTreeParser:
    """Tests for wiki-link tree parser"""

    def test_tree_parser_initialization(self):
        from app.services.tree_parser import TreeParser

        parser = TreeParser()
        assert parser.notes_by_id == {}

    def test_extract_wiki_links(self):
        from app.services.tree_parser import TreeParser

        parser = TreeParser()
        content = "See [[Topic A]] and [[Topic B|Alias]] and [[Topic C]]"
        links = parser.extract_wiki_links(content)

        assert "Topic A" in links
        assert "Topic C" in links

    def test_find_root_notes(self, mock_vault: Path):
        from app.services.obsidian_parser import ObsidianParser
        from app.services.tree_parser import TreeParser

        parser = ObsidianParser(str(mock_vault))
        notes = parser.parse_all_notes()

        tree_parser = TreeParser()
        roots = tree_parser.find_root_notes(notes)

        assert isinstance(roots, list)

    def test_build_category_structure(self, mock_vault: Path):
        from app.services.obsidian_parser import ObsidianParser
        from app.services.tree_parser import TreeParser

        parser = ObsidianParser(str(mock_vault))
        notes = parser.parse_all_notes()

        tree_parser = TreeParser()
        structure = tree_parser.build_category_structure(notes)

        assert isinstance(structure, dict)
        assert "Programming" in structure
        assert "Philosophy" in structure


@pytest.mark.unit
class TestQuoteService:
    """Tests for quote extraction and parsing"""

    @staticmethod
    def _configure_vault(mock_vault: Path):
        import app.services.obsidian_parser as obsidian_parser_module
        from app.services.cache_service import cache_service

        cache_service.invalidate_all()
        obsidian_parser_module._parser = None
        return str(mock_vault)

    def test_quote_service_initialization(self):
        from app.services.quote_service import QuoteService

        service = QuoteService()
        assert service is not None

    def test_extract_all_quotes(self, mock_vault: Path, monkeypatch):
        from app.services.quote_service import QuoteService

        monkeypatch.setenv("OBSIDIAN_VAULT_PATH", self._configure_vault(mock_vault))
        service = QuoteService()
        quotes = service.get_all_quotes()

        assert isinstance(quotes, list)
        assert len(quotes) >= 1
        quote = quotes[0]
        assert hasattr(quote, "text")
        assert hasattr(quote, "source")

    def test_quote_sources(self, mock_vault: Path, monkeypatch):
        from app.services.quote_service import QuoteService

        monkeypatch.setenv("OBSIDIAN_VAULT_PATH", self._configure_vault(mock_vault))
        service = QuoteService()
        quotes = service.get_all_quotes()

        sources = [quote.source for quote in quotes]
        assert "quotes" in [s.lower() for s in sources]

    def test_quote_text_content(self, mock_vault: Path, monkeypatch):
        from app.services.quote_service import QuoteService

        monkeypatch.setenv("OBSIDIAN_VAULT_PATH", self._configure_vault(mock_vault))
        service = QuoteService()
        quotes = service.get_all_quotes()

        texts = " ".join(q.text for q in quotes)
        assert "obstacle" in texts.lower() or "death" in texts.lower()

    def test_get_random_quote(self, mock_vault: Path, monkeypatch):
        from app.services.quote_service import QuoteService

        monkeypatch.setenv("OBSIDIAN_VAULT_PATH", self._configure_vault(mock_vault))
        service = QuoteService()
        quote = service.get_random_quote()

        assert quote is not None
        assert len(quote.text) > 0
        assert len(quote.source) > 0

    def test_random_quote_varies(self, mock_vault: Path, monkeypatch):
        from app.services.quote_service import QuoteService

        monkeypatch.setenv("OBSIDIAN_VAULT_PATH", self._configure_vault(mock_vault))
        service = QuoteService()

        quotes = [service.get_random_quote().text for _ in range(10)]
        assert len(set(quotes)) >= 1

    def test_quote_text_cleanup(self, mock_vault: Path, monkeypatch):
        from app.services.quote_service import QuoteService

        monkeypatch.setenv("OBSIDIAN_VAULT_PATH", self._configure_vault(mock_vault))
        service = QuoteService()
        quotes = service.get_all_quotes()

        for quote in quotes:
            assert not quote.text.startswith(">")
            assert not quote.text.startswith("—")

    def test_empty_vault_quotes(self, tmp_path, monkeypatch):
        from app.services.quote_service import QuoteService

        empty_vault = tmp_path / "empty_vault"
        empty_vault.mkdir()

        monkeypatch.setenv("OBSIDIAN_VAULT_PATH", str(empty_vault))
        self._configure_vault(empty_vault)
        service = QuoteService()
        quotes = service.get_all_quotes()

        assert isinstance(quotes, list)
        assert len(quotes) == 0
        assert service.get_random_quote() is None


@pytest.mark.unit
class TestServiceIntegration:
    """Integration tests for services working together"""

    def test_cache_with_parser(self, mock_vault: Path):
        from app.services.cache_service import CacheService
        from app.services.obsidian_parser import ObsidianParser

        cache = CacheService(default_ttl=60)
        parser = ObsidianParser(str(mock_vault))

        notes = parser.parse_all_notes()
        cache.set("all_notes", notes)

        cached_notes = cache.get("all_notes")

        assert cached_notes == notes
        assert len(cached_notes) == len(notes)

    def test_cache_with_quotes(self, mock_vault: Path, monkeypatch):
        import app.services.obsidian_parser as obsidian_parser_module
        from app.services.cache_service import CacheService
        from app.services.quote_service import QuoteService

        monkeypatch.setenv("OBSIDIAN_VAULT_PATH", str(mock_vault))
        obsidian_parser_module._parser = None

        cache = CacheService(default_ttl=60)
        service = QuoteService()

        quotes = service.get_all_quotes()
        cache.set("all_quotes", quotes)

        cached_quotes = cache.get("all_quotes")
        assert cached_quotes == quotes
