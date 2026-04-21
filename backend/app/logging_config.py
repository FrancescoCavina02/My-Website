"""
Structured Logging Configuration

Configures structlog for JSON-formatted structured logging with:
- Request ID correlation
- Timestamp in ISO format
- Log level
- Logger name
- Custom context fields

Production mode: JSON output for log aggregation tools
Development mode: Pretty console output with colors
"""

import logging
import sys
import structlog
from typing import Any
from app.middleware.request_id import get_request_id


def add_request_id(logger: Any, method_name: str, event_dict: dict) -> dict:
    """
    Processor that adds request ID to all log entries.
    Called automatically by structlog for every log message.
    """
    request_id = get_request_id()
    if request_id:
        event_dict["request_id"] = request_id
    return event_dict


def configure_logging(debug: bool = False) -> None:
    """
    Configure structlog with appropriate settings for dev/prod.

    Args:
        debug: If True, use pretty console output. If False, use JSON output.
    """
    # Configure standard library logging (used by libraries like uvicorn)
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=logging.DEBUG if debug else logging.INFO,
    )

    # Silence noisy loggers in production
    if not debug:
        logging.getLogger("watchdog").setLevel(logging.WARNING)
        logging.getLogger("watchdog.observers").setLevel(logging.WARNING)
        logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

    # Shared processors for both dev and prod
    shared_processors = [
        # Add log level
        structlog.stdlib.add_log_level,
        # Add timestamp
        structlog.processors.TimeStamper(fmt="iso"),
        # Add logger name
        structlog.stdlib.add_logger_name,
        # Add request ID
        add_request_id,
        # Stack info for exceptions
        structlog.processors.StackInfoRenderer(),
        # Format exceptions
        structlog.processors.format_exc_info,
    ]

    if debug:
        # Development: Pretty console output with colors
        processors = shared_processors + [
            # Pretty console renderer
            structlog.dev.ConsoleRenderer(
                colors=True,
                exception_formatter=structlog.dev.plain_traceback,
            )
        ]
    else:
        # Production: JSON output
        processors = shared_processors + [
            # JSON renderer for log aggregation
            structlog.processors.JSONRenderer()
        ]

    # Configure structlog
    structlog.configure(
        processors=processors,
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str) -> Any:
    """
    Get a structlog logger instance.

    Usage:
        logger = get_logger(__name__)
        logger.info("user_created", user_id=123, email="user@example.com")
        logger.error("database_error", error=str(e), query="SELECT ...")
    """
    return structlog.get_logger(name)
