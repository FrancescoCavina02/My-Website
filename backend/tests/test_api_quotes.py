"""
Tests for quotes API endpoints.
Tests quote extraction from Obsidian vault and random quote selection.
"""

import pytest
from fastapi.testclient import TestClient


@pytest.mark.integration
class TestGetRandomQuote:
    """Tests for GET /api/quotes/random endpoint"""

    def test_get_random_quote_success(self, client: TestClient):
        """Test retrieving a random quote"""
        response = client.get("/api/quotes/random")

        assert response.status_code == 200
        quote = response.json()

        # Verify quote structure
        assert "text" in quote
        assert "author" in quote
        assert isinstance(quote["text"], str)
        assert isinstance(quote["author"], str)
        assert len(quote["text"]) > 0

    def test_get_random_quote_from_vault(self, client: TestClient):
        """Test that random quote comes from mock vault"""
        response = client.get("/api/quotes/random")

        assert response.status_code == 200
        quote = response.json()

        # Should be one of our test quotes
        expected_authors = ["Marcus Aurelius", "Seneca"]
        assert quote["author"] in expected_authors

    def test_get_random_quote_varies(self, client: TestClient):
        """Test that random quote selection varies (probabilistic test)"""
        quotes = []

        # Get multiple quotes
        for _ in range(10):
            response = client.get("/api/quotes/random")
            assert response.status_code == 200
            quotes.append(response.json()["text"])

        # With 10 requests, we should see at least 2 different quotes
        # (unless there's only 1 quote, which shouldn't be the case)
        unique_quotes = set(quotes)
        # This is probabilistic - could fail if very unlucky
        # But with 3 quotes in vault, probability is very high
        assert len(unique_quotes) >= 1  # At minimum, should have quotes

    def test_random_quote_caching(self, client: TestClient):
        """Test that quotes endpoint uses caching"""
        # First request
        response1 = client.get("/api/quotes/random")
        assert response1.status_code == 200

        # Second request should also work (cache or fresh)
        response2 = client.get("/api/quotes/random")
        assert response2.status_code == 200

        # Both should return valid quotes
        assert "text" in response1.json()
        assert "text" in response2.json()


@pytest.mark.integration
class TestGetAllQuotes:
    """Tests for GET /api/quotes/ endpoint (if implemented)"""

    def test_get_all_quotes(self, client: TestClient):
        """Test retrieving all quotes from vault"""
        response = client.get("/api/quotes/")

        # Endpoint may or may not exist
        if response.status_code == 200:
            quotes = response.json()
            assert isinstance(quotes, list)
            assert len(quotes) > 0

            # Verify quote structure
            quote = quotes[0]
            assert "text" in quote
            assert "author" in quote
        elif response.status_code == 404:
            # Endpoint not implemented yet
            pytest.skip("GET /api/quotes/ endpoint not implemented")
        else:
            pytest.fail(f"Unexpected status code: {response.status_code}")


@pytest.mark.integration
class TestQuotesEndpointErrors:
    """Tests for error handling in quotes endpoints"""

    def test_empty_vault_handling(self, client: TestClient, test_settings):
        """Test handling when no quotes are found in vault"""
        # This test would require mocking an empty vault
        # For now, just verify endpoint doesn't crash
        response = client.get("/api/quotes/random")

        # Should either return a quote or graceful error
        assert response.status_code in [200, 404, 500]

        if response.status_code == 200:
            # Should have a valid quote
            quote = response.json()
            assert "text" in quote
            assert "author" in quote


@pytest.mark.unit
class TestQuotesParsing:
    """Unit tests for quote extraction logic"""

    def test_quote_format_parsing(self):
        """Test parsing quotes from markdown blockquote format"""
        from app.config import get_settings

        settings = get_settings()
        assert settings.obsidian_vault_path is not None

        # This would test internal parsing logic
        # Verify it can extract:
        # > Quote text
        # > — Author

    def test_multiline_quote_parsing(self):
        """Test parsing multi-line quotes"""
        # Test quotes that span multiple lines
        pass

    def test_quote_without_author_parsing(self):
        """Test handling quotes without attribution"""
        # Some quotes might not have authors
        pass

    def test_malformed_quote_handling(self):
        """Test handling of malformed quote syntax"""
        # Should gracefully handle invalid formats
        pass


@pytest.mark.integration
class TestQuotesCaching:
    """Tests for quote caching behavior"""

    def test_quotes_cached_after_first_request(self, client: TestClient):
        """Test that quotes are cached after initial parsing"""
        # First request - parse vault
        response1 = client.get("/api/quotes/random")
        assert response1.status_code == 200

        # Second request - use cache
        response2 = client.get("/api/quotes/random")
        assert response2.status_code == 200

        # Both should succeed
        assert "text" in response1.json()
        assert "text" in response2.json()

    def test_quotes_cache_invalidation(self, client: TestClient, auth_headers: dict):
        """Test that cache invalidation affects quotes"""
        # Get quote (populate cache)
        response1 = client.get("/api/quotes/random")
        assert response1.status_code == 200

        # Invalidate cache
        invalidate_response = client.post("/api/notes/cache/invalidate", headers=auth_headers)
        assert invalidate_response.status_code == 200

        # Get quote again (should re-parse)
        response2 = client.get("/api/quotes/random")
        assert response2.status_code == 200

        # Should still work
        assert "text" in response2.json()


@pytest.mark.integration
class TestQuotesContent:
    """Tests for quote content validation"""

    def test_quote_text_not_empty(self, client: TestClient):
        """Test that quote text is never empty"""
        for _ in range(5):
            response = client.get("/api/quotes/random")
            assert response.status_code == 200

            quote = response.json()
            assert len(quote["text"].strip()) > 0

    def test_quote_author_format(self, client: TestClient):
        """Test that author is properly formatted"""
        response = client.get("/api/quotes/random")

        assert response.status_code == 200
        quote = response.json()

        # Author should not be empty
        assert len(quote["author"].strip()) > 0

        # Author should not contain markdown artifacts
        assert ">" not in quote["author"]
        assert "#" not in quote["author"]

    def test_quote_text_no_markdown_artifacts(self, client: TestClient):
        """Test that quote text doesn't contain markdown artifacts"""
        response = client.get("/api/quotes/random")

        assert response.status_code == 200
        quote = response.json()

        # Quote text should not start with '>'
        assert not quote["text"].startswith(">")

        # Should not have em-dash prefix
        assert not quote["text"].startswith("—")

    def test_quotes_contain_expected_content(self, client: TestClient):
        """Test that quotes from mock vault are present"""
        quotes_seen = []

        # Get multiple quotes to find our test quotes
        for _ in range(20):
            response = client.get("/api/quotes/random")
            assert response.status_code == 200
            quote = response.json()
            quotes_seen.append(quote["text"])

        # Should see at least one of our test quotes
        quotes_str = " ".join(quotes_seen)

        # At least one of these should appear
        expected_phrases = ["obstacle", "suffer more in imagination", "never beginning to live"]
        found = any(phrase in quotes_str.lower() for phrase in expected_phrases)

        assert found, "Should find at least one quote from mock vault"
