"""
Authentication API Routes
Login endpoint for admin authentication
"""

from datetime import timedelta
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
import logging

from app.middleware.auth import verify_admin_credentials, create_access_token
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter()


class LoginRequest(BaseModel):
    """Login request schema"""
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    """Login response schema"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int


@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """
    Admin login endpoint.

    Validates credentials and returns a JWT access token.

    Args:
        credentials: Email and password

    Returns:
        Access token and metadata

    Raises:
        HTTPException: If credentials are invalid
    """
    # Verify credentials
    if not verify_admin_credentials(credentials.email, credentials.password):
        logger.warning(f"Failed login attempt for email: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=settings.jwt_access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": credentials.email},
        expires_delta=access_token_expires
    )

    logger.info(f"Successful login for admin: {credentials.email}")

    return LoginResponse(
        access_token=access_token,
        expires_in=settings.jwt_access_token_expire_minutes * 60  # Convert to seconds
    )


@router.post("/logout")
async def logout():
    """
    Logout endpoint (placeholder).

    Since we're using stateless JWT tokens, logout is handled client-side
    by discarding the token. This endpoint exists for API completeness.

    Returns:
        Success message
    """
    return {"message": "Successfully logged out"}
