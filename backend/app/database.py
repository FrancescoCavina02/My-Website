"""
Database session management for SQLAlchemy.
Provides async database session for FastAPI dependency injection.
Supports both PostgreSQL (asyncpg) and SQLite (aiosqlite).
"""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.ext.declarative import declarative_base

from app.config import get_settings

settings = get_settings()

# Convert database URL for async
database_url = settings.database_url
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif database_url.startswith("sqlite:///"):
    # For SQLite, use aiosqlite for async support
    database_url = database_url.replace("sqlite:///", "sqlite+aiosqlite:///", 1)

# Create async engine for both PostgreSQL and SQLite
engine = create_async_engine(database_url, echo=settings.debug, future=True)

AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Base class for SQLAlchemy models
Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for getting async database sessions.
    Use this in FastAPI route dependencies.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Initialize database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
