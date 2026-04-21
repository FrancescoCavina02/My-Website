"""
Request ID Middleware

Adds a unique request ID to every incoming request for tracking and correlation in logs.
The request ID is:
- Generated for each request if not provided
- Included in response headers
- Available in structlog context for all log entries
"""

import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from contextvars import ContextVar

# Context variable to store request ID for the current request
# This is thread-safe and works with async
request_id_context_var: ContextVar[str] = ContextVar("request_id", default="")


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Middleware that generates or extracts a unique request ID for each request.

    The request ID can be:
    - Provided by the client in the X-Request-ID header
    - Auto-generated as a UUID if not provided

    The request ID is:
    - Stored in a context variable for access in logs
    - Added to the response X-Request-ID header
    - Attached to the request state
    """

    def __init__(self, app, header_name: str = "X-Request-ID"):
        super().__init__(app)
        self.header_name = header_name

    async def dispatch(self, request: Request, call_next) -> Response:
        # Get request ID from header or generate new one
        request_id = request.headers.get(self.header_name)

        if not request_id:
            request_id = str(uuid.uuid4())

        # Store in context variable (accessible by structlog)
        request_id_context_var.set(request_id)

        # Attach to request state for manual access if needed
        request.state.request_id = request_id

        # Process request
        response = await call_next(request)

        # Add request ID to response headers
        response.headers[self.header_name] = request_id

        return response


def get_request_id() -> str:
    """Get the current request ID from context (returns empty string if not set)"""
    return request_id_context_var.get("")
