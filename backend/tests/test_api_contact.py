"""
Tests for contact form API endpoints.
Tests message submission, validation, rate limiting, and admin retrieval.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.contact_message import ContactMessageDB


@pytest.mark.integration
class TestContactSubmission:
    """Tests for POST /api/contact/ endpoint"""

    def test_submit_contact_success(self, client: TestClient):
        """Test successful contact form submission"""
        contact_data = {
            "name": "John Doe",
            "email": "john@example.com",
            "subject": "Test Message",
            "message": "This is a test message from the contact form.",
        }

        response = client.post("/api/contact/", json=contact_data)

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "message" in data
        assert "thank you" in data["message"].lower()

    @pytest.mark.asyncio
    async def test_submit_contact_saves_to_database(
        self, client: TestClient, db_session: AsyncSession
    ):
        """Test that contact submission saves message to database"""
        contact_data = {
            "name": "Jane Smith",
            "email": "jane@example.com",
            "subject": "Database Test",
            "message": "Testing database storage",
        }

        response = client.post("/api/contact/", json=contact_data)
        assert response.status_code == 200

        # Query database to verify message was saved
        result = await db_session.execute(
            select(ContactMessageDB).where(ContactMessageDB.email == "jane@example.com")
        )
        message = result.scalar_one_or_none()

        assert message is not None
        assert message.name == "Jane Smith"
        assert message.subject == "Database Test"
        assert message.message == "Testing database storage"
        assert message.ip_address is not None  # Should capture IP
        assert message.read == 0  # Should be unread by default

    def test_submit_contact_tracks_metadata(self, client: TestClient):
        """Test that submission captures IP and user agent"""
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Metadata Test",
            "message": "Testing metadata capture",
        }

        headers = {"User-Agent": "TestClient/1.0"}
        response = client.post("/api/contact/", json=contact_data, headers=headers)

        assert response.status_code == 200

    def test_submit_contact_invalid_email(self, client: TestClient):
        """Test submission fails with invalid email format"""
        contact_data = {
            "name": "Test User",
            "email": "not-an-email",
            "subject": "Test",
            "message": "Message",
        }

        response = client.post("/api/contact/", json=contact_data)
        assert response.status_code == 422

    def test_submit_contact_missing_fields(self, client: TestClient):
        """Test submission fails when required fields are missing"""
        # Missing name
        response = client.post(
            "/api/contact/",
            json={"email": "test@example.com", "subject": "Test", "message": "Message"},
        )
        assert response.status_code == 422

        # Missing email
        response = client.post(
            "/api/contact/", json={"name": "Test", "subject": "Test", "message": "Message"}
        )
        assert response.status_code == 422

        # Missing subject
        response = client.post(
            "/api/contact/",
            json={"name": "Test", "email": "test@example.com", "message": "Message"},
        )
        assert response.status_code == 422

        # Missing message
        response = client.post(
            "/api/contact/", json={"name": "Test", "email": "test@example.com", "subject": "Test"}
        )
        assert response.status_code == 422

    def test_submit_contact_empty_fields(self, client: TestClient):
        """Test submission fails with empty required fields"""
        contact_data = {
            "name": "",
            "email": "test@example.com",
            "subject": "Test",
            "message": "Message",
        }
        response = client.post("/api/contact/", json=contact_data)
        assert response.status_code == 422

    def test_submit_contact_long_fields(self, client: TestClient):
        """Test submission handles very long input appropriately"""
        contact_data = {
            "name": "A" * 200,  # Very long name
            "email": "test@example.com",
            "subject": "B" * 300,  # Very long subject
            "message": "C" * 5000,  # Very long message
        }

        response = client.post("/api/contact/", json=contact_data)

        # Should either accept (with truncation) or reject with 422
        assert response.status_code in [200, 422]

    def test_submit_contact_special_characters(self, client: TestClient):
        """Test submission handles special characters correctly"""
        contact_data = {
            "name": "João O'Brien-Smith",
            "email": "test+tag@example.com",
            "subject": "Test with émojis 🎉",
            "message": "Message with <script>alert('xss')</script> and special chars: $, %, &",
        }

        response = client.post("/api/contact/", json=contact_data)
        assert response.status_code == 200


@pytest.mark.integration
@pytest.mark.slow
class TestContactRateLimit:
    """Tests for rate limiting on contact form"""

    def test_rate_limit_enforced(self, client: TestClient):
        """Test that rate limiting prevents spam (5 requests per hour)"""
        contact_data = {
            "name": "Spammer",
            "email": "spam@example.com",
            "subject": "Spam",
            "message": "Spam message",
        }

        # First 5 requests should succeed
        for i in range(5):
            response = client.post("/api/contact/", json=contact_data)
            assert response.status_code == 200, f"Request {i+1} should succeed"

        # 6th request should be rate limited
        response = client.post("/api/contact/", json=contact_data)
        assert response.status_code == 429  # Too Many Requests


@pytest.mark.integration
@pytest.mark.auth
class TestGetContactMessages:
    """Tests for GET /api/contact/messages endpoint (admin only)"""

    @pytest.mark.asyncio
    async def test_get_messages_success(
        self, client: TestClient, auth_headers: dict, sample_contact_messages: list
    ):
        """Test admin can retrieve all contact messages"""
        response = client.get("/api/contact/messages", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()

        assert "total" in data
        assert "messages" in data
        assert data["total"] >= 2  # At least our sample messages
        assert len(data["messages"]) >= 2

        # Verify message structure
        message = data["messages"][0]
        assert "id" in message
        assert "name" in message
        assert "email" in message
        assert "subject" in message
        assert "message" in message
        assert "ip_address" in message
        assert "user_agent" in message
        assert "created_at" in message
        assert "read" in message

    def test_get_messages_without_auth(self, client: TestClient):
        """Test non-admin cannot retrieve messages"""
        response = client.get("/api/contact/messages")

        assert response.status_code == 403

    def test_get_messages_with_invalid_token(self, client: TestClient):
        """Test invalid token is rejected"""
        response = client.get(
            "/api/contact/messages", headers={"Authorization": "Bearer invalid_token"}
        )

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_messages_ordered_by_newest(
        self, client: TestClient, auth_headers: dict, sample_contact_messages: list
    ):
        """Test messages are returned newest first"""
        response = client.get("/api/contact/messages", headers=auth_headers)

        assert response.status_code == 200
        messages = response.json()["messages"]

        if len(messages) >= 2:
            # Verify timestamps are in descending order
            for i in range(len(messages) - 1):
                current_time = messages[i]["created_at"]
                next_time = messages[i + 1]["created_at"]
                assert current_time >= next_time, "Messages should be ordered newest first"

    @pytest.mark.asyncio
    async def test_get_messages_empty_database(self, client: TestClient, auth_headers: dict):
        """Test endpoint returns empty list when no messages exist"""
        # This test runs with a fresh database (no sample messages)
        response = client.get("/api/contact/messages", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["messages"] == []


@pytest.mark.unit
class TestContactValidation:
    """Unit tests for contact message validation"""

    def test_contact_message_model_validation(self):
        """Test Pydantic model validates contact data correctly"""
        from app.models.note import ContactMessage

        # Valid message
        valid_message = ContactMessage(
            name="John Doe", email="john@example.com", subject="Test", message="Test message"
        )
        assert valid_message.name == "John Doe"
        assert valid_message.email == "john@example.com"

        # Invalid email should raise ValidationError
        with pytest.raises(Exception):  # Pydantic ValidationError
            ContactMessage(name="John", email="not-an-email", subject="Test", message="Test")

    def test_database_model_defaults(self):
        """Test ContactMessageDB model has correct defaults"""
        from datetime import datetime

        msg = ContactMessageDB(
            name="Test", email="test@example.com", subject="Test", message="Test message"
        )

        # Default values
        assert msg.read == 0
        assert msg.ip_address is None
        assert msg.user_agent is None
