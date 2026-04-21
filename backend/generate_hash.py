#!/usr/bin/env python3
"""Generate bcrypt hash for admin password."""
import sys

try:
    from passlib.hash import bcrypt
    password = sys.argv[1] if len(sys.argv) > 1 else "admin123"
    hash_value = bcrypt.hash(password)
    print(hash_value)
except ImportError:
    print("Error: passlib not installed. Run: pip install passlib[bcrypt]")
    sys.exit(1)
