"""
Tests for notes API endpoints.
Tests note parsing, tree navigation, search, and caching.
"""

import pytest
from fastapi.testclient import TestClient


@pytest.mark.integration
class TestGetAllNotes:
    """Tests for GET /api/notes/ endpoint"""

    def test_get_all_notes_success(self, client: TestClient):
        """Test retrieving all notes from Obsidian vault"""
        response = client.get("/api/notes/")

        assert response.status_code == 200
        notes = response.json()

        # Should return list of notes
        assert isinstance(notes, list)
        assert len(notes) > 0  # Should have notes from mock vault

        # Verify note structure
        note = notes[0]
        assert "id" in note
        assert "title" in note
        assert "content" in note
        assert "path" in note
        assert "tags" in note
        assert isinstance(note["tags"], list)

    def test_get_all_notes_contains_expected_notes(self, client: TestClient):
        """Test that response includes notes from mock vault"""
        response = client.get("/api/notes/")

        assert response.status_code == 200
        notes = response.json()

        # Extract titles
        titles = [note["title"] for note in notes]

        # Should include our test notes
        assert "Python Basics" in titles
        assert "FastAPI Guide" in titles
        assert "Stoicism" in titles

    def test_get_all_notes_caching(self, client: TestClient):
        """Test that repeated requests use cache"""
        # First request - should parse vault
        response1 = client.get("/api/notes/")
        assert response1.status_code == 200
        notes1 = response1.json()

        # Second request - should use cache
        response2 = client.get("/api/notes/")
        assert response2.status_code == 200
        notes2 = response2.json()

        # Results should be identical
        assert notes1 == notes2


@pytest.mark.integration
class TestGetNoteById:
    """Tests for GET /api/notes/{note_id} endpoint"""

    def test_get_note_by_id_success(self, client: TestClient):
        """Test retrieving a specific note by ID"""
        # First get all notes to find a valid ID
        response = client.get("/api/notes/")
        notes = response.json()
        assert len(notes) > 0

        note_id = notes[0]["id"]

        # Get specific note
        response = client.get(f"/api/notes/{note_id}")

        assert response.status_code == 200
        note = response.json()

        assert note["id"] == note_id
        assert "title" in note
        assert "content" in note
        assert "path" in note
        assert "tags" in note

    def test_get_note_by_id_not_found(self, client: TestClient):
        """Test 404 when note ID doesn't exist"""
        response = client.get("/api/notes/nonexistent-id")

        assert response.status_code == 404
        assert "detail" in response.json()

    def test_get_note_content_parsing(self, client: TestClient):
        """Test that note content is parsed correctly"""
        # Get all notes
        response = client.get("/api/notes/")
        notes = response.json()

        # Find Python Basics note
        python_note = next((n for n in notes if n["title"] == "Python Basics"), None)
        assert python_note is not None

        # Get full note details
        response = client.get(f"/api/notes/{python_note['id']}")
        note = response.json()

        # Verify content contains expected sections
        content = note["content"]
        assert "Introduction" in content
        assert "Python is a high-level programming language" in content

    def test_get_note_tags_parsing(self, client: TestClient):
        """Test that note tags are parsed correctly"""
        response = client.get("/api/notes/")
        notes = response.json()

        # Find FastAPI Guide note
        fastapi_note = next((n for n in notes if n["title"] == "FastAPI Guide"), None)
        assert fastapi_note is not None

        # Verify tags
        assert "programming" in fastapi_note["tags"]
        assert "fastapi" in fastapi_note["tags"]


@pytest.mark.integration
class TestSearchNotes:
    """Tests for GET /api/notes/search endpoint"""

    def test_search_notes_success(self, client: TestClient):
        """Test searching notes by query"""
        response = client.get("/api/notes/search?q=python")

        assert response.status_code == 200
        results = response.json()

        assert isinstance(results, list)
        assert len(results) > 0

        # Results should contain 'python' in title, content, or tags
        for note in results:
            note_text = f"{note['title']} {note['content']} {' '.join(note['tags'])}".lower()
            assert "python" in note_text

    def test_search_notes_case_insensitive(self, client: TestClient):
        """Test search is case insensitive"""
        response1 = client.get("/api/notes/search?q=python")
        response2 = client.get("/api/notes/search?q=PYTHON")
        response3 = client.get("/api/notes/search?q=Python")

        assert response1.status_code == 200
        assert response2.status_code == 200
        assert response3.status_code == 200

        # All should return same results
        results1 = response1.json()
        results2 = response2.json()
        results3 = response3.json()

        assert len(results1) == len(results2) == len(results3)

    def test_search_notes_no_results(self, client: TestClient):
        """Test search returns empty list when no matches"""
        response = client.get("/api/notes/search?q=nonexistentterm12345")

        assert response.status_code == 200
        results = response.json()
        assert results == []

    def test_search_notes_missing_query(self, client: TestClient):
        """Test search requires query parameter"""
        response = client.get("/api/notes/search")

        # Should require query parameter
        assert response.status_code == 422

    def test_search_notes_empty_query(self, client: TestClient):
        """Test search with empty query"""
        response = client.get("/api/notes/search?q=")

        # Should either return all notes or validation error
        assert response.status_code in [200, 422]

    def test_search_multiple_terms(self, client: TestClient):
        """Test search with multiple terms"""
        response = client.get("/api/notes/search?q=fastapi+api")

        assert response.status_code == 200
        results = response.json()

        # Should find FastAPI Guide note
        titles = [note["title"] for note in results]
        assert "FastAPI Guide" in titles

    def test_search_special_characters(self, client: TestClient):
        """Test search handles special characters"""
        # Search for special characters should not cause errors
        special_queries = ["c++", "c#", "f(x)", "a+b"]

        for query in special_queries:
            response = client.get(f"/api/notes/search?q={query}")
            assert response.status_code == 200


@pytest.mark.integration
class TestGetNoteTree:
    """Tests for GET /api/notes/tree endpoint"""

    def test_get_tree_success(self, client: TestClient):
        """Test retrieving folder tree structure"""
        response = client.get("/api/notes/tree")

        assert response.status_code == 200
        tree = response.json()

        # Should return tree structure
        assert isinstance(tree, list)
        assert len(tree) > 0

        # Verify tree node structure
        node = tree[0]
        assert "name" in node
        assert "type" in node
        assert node["type"] in ["folder", "file"]

    def test_tree_contains_folders(self, client: TestClient):
        """Test tree includes expected folders"""
        response = client.get("/api/notes/tree")
        tree = response.json()

        # Extract folder names
        folder_names = [node["name"] for node in tree if node["type"] == "folder"]

        # Should include our test folders
        assert "Programming" in folder_names
        assert "Philosophy" in folder_names

    def test_tree_contains_files(self, client: TestClient):
        """Test tree includes files within folders"""
        response = client.get("/api/notes/tree")
        tree = response.json()

        # Find Programming folder
        programming = next((n for n in tree if n["name"] == "Programming"), None)
        assert programming is not None
        assert programming["type"] == "folder"

        # Should have children
        if "children" in programming:
            children_names = [child["name"] for child in programming["children"]]
            assert any("Python Basics" in name for name in children_names)
            assert any("FastAPI Guide" in name for name in children_names)

    def test_tree_nested_structure(self, client: TestClient):
        """Test tree correctly represents nested structure"""
        response = client.get("/api/notes/tree")
        tree = response.json()

        # All top-level items should be either folders or files
        for item in tree:
            assert item["type"] in ["folder", "file"]
            if item["type"] == "folder" and "children" in item:
                # Folders can have children
                assert isinstance(item["children"], list)


@pytest.mark.integration
@pytest.mark.auth
class TestCacheInvalidation:
    """Tests for POST /api/notes/cache/invalidate endpoint (admin only)"""

    def test_invalidate_cache_success(self, client: TestClient, auth_headers: dict):
        """Test admin can invalidate cache"""
        response = client.post("/api/notes/cache/invalidate", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "invalidated" in data["message"].lower() or "cleared" in data["message"].lower()

    def test_invalidate_cache_without_auth(self, client: TestClient):
        """Test non-admin cannot invalidate cache"""
        response = client.post("/api/notes/cache/invalidate")

        assert response.status_code == 403

    def test_cache_invalidation_effects(self, client: TestClient, auth_headers: dict):
        """Test that cache invalidation forces fresh parse"""
        # Get notes (populate cache)
        response1 = client.get("/api/notes/")
        assert response1.status_code == 200

        # Invalidate cache
        response = client.post("/api/notes/cache/invalidate", headers=auth_headers)
        assert response.status_code == 200

        # Get notes again (should re-parse)
        response2 = client.get("/api/notes/")
        assert response2.status_code == 200

        # Should still get valid results
        notes = response2.json()
        assert isinstance(notes, list)
        assert len(notes) > 0


@pytest.mark.integration
class TestNotesEndpointErrors:
    """Tests for error handling in notes endpoints"""

    def test_invalid_note_id_format(self, client: TestClient):
        """Test handling of invalid note ID formats"""
        # Special characters that might cause issues
        invalid_ids = ["../etc/passwd", "<script>", "../../secrets"]

        for invalid_id in invalid_ids:
            response = client.get(f"/api/notes/{invalid_id}")
            # Should return 404, not 500
            assert response.status_code == 404

    def test_very_long_note_id(self, client: TestClient):
        """Test handling of very long note IDs"""
        very_long_id = "a" * 10000
        response = client.get(f"/api/notes/{very_long_id}")

        # Should handle gracefully (404 or 400)
        assert response.status_code in [400, 404]

    def test_very_long_search_query(self, client: TestClient):
        """Test handling of very long search queries"""
        very_long_query = "a" * 10000
        response = client.get(f"/api/notes/search?q={very_long_query}")

        # Should handle gracefully
        assert response.status_code in [200, 400, 422]


@pytest.mark.unit
class TestNotesParsing:
    """Unit tests for note content parsing"""

    def test_markdown_heading_extraction(self):
        """Test extraction of headings from markdown"""
        from app.config import get_settings
        from app.services.obsidian_parser import ObsidianParser

        settings = get_settings()
        ObsidianParser(settings.obsidian_vault_path)

        # This would test the internal parsing logic
        # Implementation depends on parser methods being accessible

    def test_tag_extraction(self):
        """Test extraction of tags from markdown"""
        # Test parsing tags in format #tag, #multi-word-tag
        # Implementation depends on parser structure
        pass
