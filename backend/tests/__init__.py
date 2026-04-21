"""
Tests package for backend application.

Contains comprehensive test suite covering:
- API endpoints (auth, contact, notes, quotes)
- Business logic services (parser, cache, quotes)
- Database operations
- Authentication and authorization
- Rate limiting and security

Run tests with: pytest
Run with coverage: pytest --cov=app
Run specific test file: pytest tests/test_api_auth.py
Run specific test class: pytest tests/test_api_auth.py::TestAuthLogin
Run specific test: pytest tests/test_api_auth.py::TestAuthLogin::test_login_success
"""
