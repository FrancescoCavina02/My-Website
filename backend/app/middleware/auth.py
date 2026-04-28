"""
Authentication Middleware
JWT token verification and admin authentication
"""

from datetime import datetime, timedelta
from typing import Optional

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.config import get_settings

settings = get_settings()
security = HTTPBearer()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.

    Args:
        data: Dictionary of claims to encode in the token
        expires_delta: Optional expiration time delta

    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.jwt_access_token_expire_minutes)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)

    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a bcrypt hash.

    Args:
        plain_password: Plain text password
        hashed_password: Bcrypt hashed password

    Returns:
        True if password matches, False otherwise
    """
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def verify_admin_credentials(email: str, password: str) -> bool:
    """
    Verify admin credentials against environment variables.

    Args:
        email: Email address to verify
        password: Plain text password to verify

    Returns:
        True if credentials are valid, False otherwise
    """
    if email != settings.admin_email:
        return False

    return verify_password(password, settings.admin_password_hash)


async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Verify JWT token and return payload.

    Used as a FastAPI dependency to protect endpoints.

    Args:
        credentials: Bearer token from request header

    Returns:
        Token payload dictionary

    Raises:
        HTTPException: If token is invalid or expired
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])

        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception

        # Verify email matches admin email
        if email != settings.admin_email:
            raise credentials_exception

        return payload

    except JWTError:
        raise credentials_exception


async def verify_admin(token_payload: dict = Depends(verify_token)) -> dict:
    """
    Verify that the token belongs to an admin user.

    Used as a FastAPI dependency for admin-only endpoints.

    Args:
        token_payload: Token payload from verify_token dependency

    Returns:
        Token payload dictionary

    Raises:
        HTTPException: If user is not an admin
    """
    # In this simple implementation, any valid token is for the admin
    # In a multi-user system, you would check roles here
    return token_payload
