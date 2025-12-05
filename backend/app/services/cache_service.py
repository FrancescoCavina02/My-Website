"""
Cache Service
In-memory cache with TTL for efficient vault reading
"""

import time
from typing import Any, Optional, Dict
from threading import Lock
import logging

logger = logging.getLogger(__name__)


class CacheService:
    """Thread-safe in-memory cache with TTL"""
    
    def __init__(self, default_ttl: int = 300):
        """
        Initialize cache service
        
        Args:
            default_ttl: Default time-to-live in seconds (default: 5 minutes)
        """
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._lock = Lock()
        self.default_ttl = default_ttl
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache if not expired
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found/expired
        """
        with self._lock:
            if key not in self._cache:
                return None
            
            entry = self._cache[key]
            if time.time() > entry["expires_at"]:
                # Entry expired, remove it
                del self._cache[key]
                logger.debug(f"Cache miss (expired): {key}")
                return None
            
            logger.debug(f"Cache hit: {key}")
            return entry["value"]
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """
        Set value in cache
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time-to-live in seconds (uses default if not specified)
        """
        ttl = ttl or self.default_ttl
        
        with self._lock:
            self._cache[key] = {
                "value": value,
                "expires_at": time.time() + ttl,
                "created_at": time.time()
            }
            logger.debug(f"Cache set: {key} (TTL: {ttl}s)")
    
    def invalidate(self, key: str) -> bool:
        """
        Remove a specific key from cache
        
        Args:
            key: Cache key to invalidate
            
        Returns:
            True if key was found and removed
        """
        with self._lock:
            if key in self._cache:
                del self._cache[key]
                logger.debug(f"Cache invalidated: {key}")
                return True
            return False
    
    def invalidate_all(self) -> int:
        """
        Clear all cached entries
        
        Returns:
            Number of entries cleared
        """
        with self._lock:
            count = len(self._cache)
            self._cache.clear()
            logger.info(f"Cache cleared: {count} entries removed")
            return count
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics
        
        Returns:
            Dictionary with cache stats
        """
        with self._lock:
            now = time.time()
            valid_entries = sum(
                1 for entry in self._cache.values() 
                if now <= entry["expires_at"]
            )
            return {
                "total_entries": len(self._cache),
                "valid_entries": valid_entries,
                "keys": list(self._cache.keys())
            }


# Global cache instance
cache_service = CacheService()
