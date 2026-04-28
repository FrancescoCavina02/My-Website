"""
Test fixtures and configuration for pytest.
Provides reusable fixtures for database, authentication, and API testing.
"""

import asyncio
import os
import tempfile
from pathlib import Path
from typing import AsyncGenerator, Generator

import bcrypt
import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool

# Ensure required settings exist before importing app modules that call get_settings() at import time.
os.environ.setdefault("OBSIDIAN_VAULT_PATH", tempfile.gettempdir())
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-do-not-use-in-production-123456")
os.environ.setdefault("ADMIN_EMAIL", "test@example.com")
os.environ.setdefault(
    "ADMIN_PASSWORD_HASH",
    bcrypt.hashpw("test_password_123".encode("utf-8"), bcrypt.gensalt(rounds=4)).decode("utf-8"),
)

from app.config import Settings, get_settings
from app.database import Base, get_db
from app.main import app
from app.middleware.rate_limit import limiter
from app.models.contact_message import ContactMessageDB


# Override settings for testing
class TestSettings(Settings):
    """Test-specific settings that override production values"""

    database_url: str = "sqlite+aiosqlite:///:memory:"
    debug: bool = True
    cors_origins: str = "http://localhost:3000"
    cache_ttl: int = 60
    jwt_secret_key: str = "test-secret-key-do-not-use-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    admin_email: str = "test@example.com"
    admin_password_hash: str = ""  # Will be set in fixture
    obsidian_vault_path: str = ""  # Will be set in fixture

    model_config = {"extra": "allow", "validate_assignment": True}

    def get_cors_origins_list(self) -> list:
        return [origin.strip() for origin in self.cors_origins.split(",")]


@pytest.fixture(scope="session")
def test_password() -> str:
    """Test admin password"""
    return "test_password_123"


@pytest.fixture(scope="session")
def test_password_hash(test_password: str) -> str:
    """Generate bcrypt hash for test password"""
    return bcrypt.hashpw(test_password.encode("utf-8"), bcrypt.gensalt(rounds=4)).decode("utf-8")


@pytest.fixture(scope="session")
def mock_vault(tmp_path_factory) -> Path:
    """
    Create a temporary Obsidian vault with sample markdown files for testing.

    Structure:
    - vault/
      - Programming/
        - Python Basics.md
        - FastAPI Guide.md
      - Philosophy/
        - Stoicism.md
      - quotes.md
    """
    vault_path = tmp_path_factory.mktemp("obsidian_vault")

    # Create directory structure
    programming_dir = vault_path / "Programming"
    programming_dir.mkdir()
    philosophy_dir = vault_path / "Philosophy"
    philosophy_dir.mkdir()

    # Create sample notes
    (programming_dir / "Python Basics.md").write_text(
        """# Python Basics

## Introduction
Python is a high-level programming language.

## Features
- Easy to learn
- Readable syntax
- Extensive libraries

## Example
```python
def hello_world():
    print("Hello, World!")
```

#programming #python
"""
    )

    (programming_dir / "FastAPI Guide.md").write_text(
        """# FastAPI Guide

FastAPI is a modern web framework for building APIs with Python.

## Key Features
- Fast performance
- Automatic API documentation
- Type hints support

## Example Endpoint
```python
@app.get("/")
async def root():
    return {"message": "Hello World"}
```

#programming #fastapi #api
"""
    )

    (philosophy_dir / "Stoicism.md").write_text(
        """# Stoicism

## Overview
Stoicism is an ancient Greek philosophy focusing on virtue and wisdom.

## Key Principles
- Focus on what you can control
- Practice negative visualization
- Live according to nature

## Famous Stoics
- Marcus Aurelius
- Seneca
- Epictetus

#philosophy #stoicism
"""
    )

    (vault_path / "quotes.md").write_text(
        """# Favorite Quotes

> The obstacle is the way.
> — Marcus Aurelius

> We suffer more in imagination than in reality.
> — Seneca

> It is not death that a man should fear, but he should fear never beginning to live.
> — Marcus Aurelius
"""
    )

    return vault_path


@pytest.fixture(scope="session")
def test_settings(test_password_hash: str, mock_vault: Path) -> TestSettings:
    """Override application settings for testing"""
    settings = TestSettings(
        admin_password_hash=test_password_hash, obsidian_vault_path=str(mock_vault)
    )
    return settings


@pytest.fixture(scope="session")
def override_get_settings(test_settings: TestSettings):
    """Override the get_settings dependency"""
    import app.api.auth as auth_api
    import app.middleware.auth as auth_middleware
    import app.config as app_config

    def _override():
        return test_settings

    app_config.settings = test_settings
    auth_api.settings = test_settings
    auth_middleware.settings = test_settings
    app.dependency_overrides[get_settings] = _override
    yield
    app.dependency_overrides.clear()


@pytest.fixture(scope="session")
async def test_engine(test_settings: TestSettings):
    """Create async test database engine"""
    engine = create_async_engine(
        test_settings.database_url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,  # Use static pool for in-memory SQLite
        echo=False,
    )

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    # Cleanup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture
async def db_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """
    Provide a clean database session for each test.
    Automatically rolls back changes after each test.
    """
    # Create session factory
    async_session_factory = async_sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session_factory() as session:
        for table in reversed(Base.metadata.sorted_tables):
            await session.execute(table.delete())
        await session.commit()
        yield session
        await session.rollback()


@pytest.fixture
def override_get_db(db_session: AsyncSession):
    """Override the get_db dependency to use test database"""

    async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    yield
    app.dependency_overrides.pop(get_db, None)


@pytest.fixture
def client(override_get_settings, override_get_db) -> TestClient:
    """
    Synchronous test client for API testing.
    Use this for simple endpoint tests.
    """
    return TestClient(app)


@pytest.fixture
async def async_client(override_get_settings, override_get_db) -> AsyncGenerator[AsyncClient, None]:
    """
    Async test client for API testing.
    Use this for testing async endpoints and streaming responses.
    """
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


@pytest.fixture
def admin_token(client: TestClient, test_settings: TestSettings, test_password: str) -> str:
    """
    Generate a valid JWT token for admin authentication.
    Use this fixture for testing protected endpoints.
    """
    response = client.post(
        "/api/auth/login", json={"email": test_settings.admin_email, "password": test_password}
    )
    assert response.status_code == 200, f"Login failed: {response.text}"
    return response.json()["access_token"]


@pytest.fixture
def auth_headers(admin_token: str) -> dict:
    """
    Authorization headers with valid JWT token.
    Use this for authenticated requests.
    """
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
async def sample_contact_messages(db_session: AsyncSession) -> list[ContactMessageDB]:
    """
    Create sample contact messages in the database for testing.
    """
    messages = [
        ContactMessageDB(
            name="John Doe",
            email="john@example.com",
            subject="Test Subject 1",
            message="This is a test message",
            ip_address="127.0.0.1",
            user_agent="Mozilla/5.0",
        ),
        ContactMessageDB(
            name="Jane Smith",
            email="jane@example.com",
            subject="Test Subject 2",
            message="Another test message",
            ip_address="127.0.0.1",
            user_agent="Mozilla/5.0",
            read=1,
        ),
    ]

    for msg in messages:
        db_session.add(msg)
    await db_session.commit()

    # Refresh to get IDs
    for msg in messages:
        await db_session.refresh(msg)

    return messages


# Event loop fixture for session scope
@pytest.fixture(scope="session")
def event_loop():
    """Create an event loop for the test session"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    """Reset in-memory rate limiter state between tests."""
    limiter._storage.reset()
    yield
