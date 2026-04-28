"""
Tests for authentication API endpoints.
Tests JWT token generation, validation, and admin authentication.
"""

import pytest
from fastapi.testclient import TestClient
from jose import jwt

from app.config import get_settings


@pytest.mark.integration
@pytest.mark.auth
class TestAuthLogin:
    """Tests for POST /api/auth/login endpoint"""

    def test_login_success(self, client: TestClient, test_settings, test_password):
        """Test successful admin login with correct credentials"""
        response = client.post(
            "/api/auth/login", json={"email": test_settings.admin_email, "password": test_password}
        )

        assert response.status_code == 200
        data = response.json()

        # Verify response structure
        assert "access_token" in data
        assert "token_type" in data
        assert "expires_in" in data
        assert data["token_type"] == "bearer"
        assert data["expires_in"] == test_settings.jwt_access_token_expire_minutes * 60

        # Verify token is valid JWT
        token = data["access_token"]
        decoded = jwt.decode(
            token, test_settings.jwt_secret_key, algorithms=[test_settings.jwt_algorithm]
        )
        assert decoded["sub"] == test_settings.admin_email
        assert "exp" in decoded

    def test_login_wrong_password(self, client: TestClient, test_settings):
        """Test login fails with incorrect password"""
        response = client.post(
            "/api/auth/login",
            json={"email": test_settings.admin_email, "password": "wrong_password"},
        )

        assert response.status_code == 401
        assert "detail" in response.json()

    def test_login_wrong_email(self, client: TestClient, test_password):
        """Test login fails with incorrect email"""
        response = client.post(
            "/api/auth/login", json={"email": "wrong@example.com", "password": test_password}
        )

        assert response.status_code == 401
        assert "detail" in response.json()

    def test_login_invalid_email_format(self, client: TestClient, test_password):
        """Test login fails with invalid email format"""
        response = client.post(
            "/api/auth/login", json={"email": "not-an-email", "password": test_password}
        )

        # Should fail validation
        assert response.status_code == 422

    def test_login_missing_fields(self, client: TestClient):
        """Test login fails when required fields are missing"""
        # Missing password
        response = client.post("/api/auth/login", json={"email": "test@example.com"})
        assert response.status_code == 422

        # Missing email
        response = client.post("/api/auth/login", json={"password": "password123"})
        assert response.status_code == 422

        # Missing both
        response = client.post("/api/auth/login", json={})
        assert response.status_code == 422

    def test_login_empty_credentials(self, client: TestClient):
        """Test login fails with empty email or password"""
        response = client.post("/api/auth/login", json={"email": "", "password": "password123"})
        assert response.status_code == 422

        response = client.post(
            "/api/auth/login", json={"email": "test@example.com", "password": ""}
        )
        assert response.status_code == 422


@pytest.mark.integration
@pytest.mark.auth
class TestAuthLogout:
    """Tests for POST /api/auth/logout endpoint"""

    def test_logout_success(self, client: TestClient, auth_headers):
        """Test successful logout with valid token"""
        response = client.post("/api/auth/logout", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Successfully logged out"

    def test_logout_without_token(self, client: TestClient):
        """Test logout fails without authentication token"""
        response = client.post("/api/auth/logout")

        assert response.status_code == 403
        assert "detail" in response.json()

    def test_logout_with_invalid_token(self, client: TestClient):
        """Test logout fails with invalid token"""
        response = client.post(
            "/api/auth/logout", headers={"Authorization": "Bearer invalid_token"}
        )

        assert response.status_code == 401

    def test_logout_with_malformed_header(self, client: TestClient, admin_token):
        """Test logout fails with malformed authorization header"""
        # Missing 'Bearer' prefix
        response = client.post("/api/auth/logout", headers={"Authorization": admin_token})
        assert response.status_code == 403

        # Wrong prefix
        response = client.post(
            "/api/auth/logout", headers={"Authorization": f"Token {admin_token}"}
        )
        assert response.status_code == 403


@pytest.mark.integration
@pytest.mark.auth
class TestProtectedEndpoints:
    """Tests for endpoints that require authentication"""

    def test_access_protected_endpoint_with_valid_token(self, client: TestClient, auth_headers):
        """Test accessing protected endpoint with valid JWT token"""
        # Try to invalidate cache (admin-only endpoint)
        response = client.post("/api/notes/cache/invalidate", headers=auth_headers)

        # Should succeed (200) or return method-specific error, but NOT 401/403
        assert response.status_code != 401
        assert response.status_code != 403

    def test_access_protected_endpoint_without_token(self, client: TestClient):
        """Test accessing protected endpoint without token returns 403"""
        response = client.post("/api/notes/cache/invalidate")

        assert response.status_code == 403

    def test_access_protected_endpoint_with_expired_token(self, client: TestClient, test_settings):
        """Test accessing protected endpoint with expired token"""
        # Create an expired token (exp in the past)
        import time
        from datetime import datetime, timedelta

        from app.middleware.auth import create_access_token

        expired_token = create_access_token(
            data={"sub": test_settings.admin_email},
            expires_delta=timedelta(seconds=-1),  # Already expired
        )

        # Wait a moment to ensure it's really expired
        time.sleep(0.1)

        response = client.post(
            "/api/notes/cache/invalidate", headers={"Authorization": f"Bearer {expired_token}"}
        )

        assert response.status_code == 401

    def test_access_protected_endpoint_with_wrong_subject(self, client: TestClient, test_settings):
        """Test token with wrong subject (email) is rejected"""
        from app.middleware.auth import create_access_token

        # Create token with different email
        wrong_token = create_access_token(data={"sub": "hacker@example.com"})

        response = client.post(
            "/api/notes/cache/invalidate", headers={"Authorization": f"Bearer {wrong_token}"}
        )

        assert response.status_code == 401


@pytest.mark.unit
class TestTokenGeneration:
    """Unit tests for JWT token generation and validation"""

    def test_create_access_token(self, test_settings):
        """Test JWT token creation"""
        from datetime import timedelta

        from app.middleware.auth import create_access_token

        token = create_access_token(
            data={"sub": "test@example.com"}, expires_delta=timedelta(minutes=30)
        )

        # Verify it's a valid JWT
        decoded = jwt.decode(
            token, test_settings.jwt_secret_key, algorithms=[test_settings.jwt_algorithm]
        )

        assert decoded["sub"] == "test@example.com"
        assert "exp" in decoded

    def test_password_verification(self, test_password, test_password_hash):
        """Test bcrypt password verification"""
        from app.middleware.auth import verify_password

        # Correct password
        assert verify_password(test_password, test_password_hash) is True

        # Wrong password
        assert verify_password("wrong_password", test_password_hash) is False

        # Empty password
        assert verify_password("", test_password_hash) is False

    def test_admin_credentials_verification(self, test_settings, test_password):
        """Test admin credentials verification"""
        from app.middleware.auth import verify_admin_credentials

        # Correct credentials
        assert verify_admin_credentials(test_settings.admin_email, test_password) is True

        # Wrong email
        assert verify_admin_credentials("wrong@example.com", test_password) is False

        # Wrong password
        assert verify_admin_credentials(test_settings.admin_email, "wrong_password") is False
