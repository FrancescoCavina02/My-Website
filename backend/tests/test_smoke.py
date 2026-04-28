import os

from fastapi.testclient import TestClient

os.environ.setdefault("OBSIDIAN_VAULT_PATH", "/tmp/test-vault")
os.environ.setdefault("JWT_SECRET_KEY", "ci-test-only-do-not-use-in-production-aabbccddeeff0011")
os.environ.setdefault("ADMIN_EMAIL", "test@example.com")
os.environ.setdefault("ADMIN_PASSWORD_HASH", "$2b$12$test_hash_placeholder")

from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    body = response.json()
    assert body["docs"] == "/docs"


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_notes_list_endpoint_available():
    response = client.get("/api/notes")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_quotes_endpoint_responds():
    response = client.get("/api/quotes/random")
    assert response.status_code in {200, 404}
