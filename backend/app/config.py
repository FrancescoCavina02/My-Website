"""
Application configuration using Pydantic Settings.
Validates environment variables on startup and provides type-safe access.
"""

from pathlib import Path
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with validation."""

    # Obsidian Vault
    obsidian_vault_path: str

    # Server
    port: int = 8000
    debug: bool = False

    # CORS
    cors_origins: str = "http://localhost:3000"

    # Cache
    cache_ttl: int = 300

    # Database
    database_url: str = "sqlite:///./portfolio.db"

    # JWT Authentication
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 1440  # 24 hours

    # Admin Credentials
    admin_email: str
    admin_password_hash: str

    # Email
    sendgrid_api_key: str = ""
    notification_email: str = ""
    from_email: str = "noreply@francescocavina.com"

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=False, extra="ignore"
    )

    @field_validator("obsidian_vault_path")
    @classmethod
    def validate_vault_path(cls, v: str) -> str:
        """Validate that the Obsidian vault path exists."""
        path = Path(v)
        if not path.exists():
            raise ValueError(f"Obsidian vault path does not exist: {v}")
        if not path.is_dir():
            raise ValueError(f"Obsidian vault path is not a directory: {v}")
        return v

    @field_validator("jwt_secret_key")
    @classmethod
    def validate_jwt_secret(cls, v: str) -> str:
        """Validate JWT secret key is sufficiently complex."""
        if len(v) < 32:
            raise ValueError(
                "JWT secret key must be at least 32 characters long. "
                "Generate one with: openssl rand -hex 32"
            )
        if v == "your-secret-key-here-change-in-production":
            raise ValueError(
                "JWT secret key must be changed from default value! "
                "Generate one with: openssl rand -hex 32"
            )
        return v

    @field_validator("admin_password_hash")
    @classmethod
    def validate_password_hash(cls, v: str) -> str:
        """Validate admin password hash."""
        if "example" in v.lower() or "replace" in v.lower():
            raise ValueError(
                "Admin password hash must be changed from example value! "
                "Generate one with: python -c \"from passlib.hash import bcrypt; print(bcrypt.hash('your_password'))\""
            )
        if not v.startswith("$2b$"):
            raise ValueError("Admin password hash must be a valid bcrypt hash")
        return v

    def get_cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.split(",")]


# Global settings instance
settings: Settings | None = None


def get_settings() -> Settings:
    """Get or create settings instance."""
    global settings
    if settings is None:
        settings = Settings()
    return settings
