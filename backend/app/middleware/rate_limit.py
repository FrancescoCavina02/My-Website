"""
Rate Limiting Configuration
Uses slowapi for request rate limiting
"""

from slowapi import Limiter
from slowapi.util import get_remote_address


# Create limiter instance
limiter = Limiter(key_func=get_remote_address)


def get_limiter():
    """
    Get the rate limiter instance.

    Returns:
        Limiter: Configured slowapi Limiter
    """
    return limiter
