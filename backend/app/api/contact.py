"""
Contact API Routes
Endpoint for contact form submissions
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging
from datetime import datetime

from app.models.note import ContactMessage
from app.models.contact_message import ContactMessageDB
from app.database import get_db
from app.middleware.auth import verify_admin
from app.middleware.rate_limit import limiter

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/")
@limiter.limit("5/hour")
async def submit_contact(
    message: ContactMessage,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Submit a contact form message

    Stores the message in the database with IP address and user agent tracking.
    Rate limited to 5 requests per hour per IP address to prevent spam.
    """
    # Log the message
    logger.info(f"Contact form submission from {message.name} ({message.email})")

    # Create database record
    db_message = ContactMessageDB(
        name=message.name,
        email=message.email,
        subject=message.subject,
        message=message.message,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent", "")[:500]  # Truncate to column length
    )

    db.add(db_message)
    await db.commit()
    await db.refresh(db_message)

    logger.info(f"Contact message saved to database with ID: {db_message.id}")

    return {
        "success": True,
        "message": "Thank you for your message. I will get back to you soon."
    }


@router.get("/messages")
async def get_messages(
    db: AsyncSession = Depends(get_db),
    _admin: dict = Depends(verify_admin)
):
    """
    Get all contact messages (admin endpoint - requires authentication)

    Returns messages ordered by newest first.
    Requires valid JWT token from /api/auth/login.
    """
    result = await db.execute(
        select(ContactMessageDB).order_by(ContactMessageDB.created_at.desc())
    )
    messages = result.scalars().all()

    # Convert to dict for JSON serialization
    messages_list = [
        {
            "id": msg.id,
            "name": msg.name,
            "email": msg.email,
            "subject": msg.subject,
            "message": msg.message,
            "ip_address": msg.ip_address,
            "user_agent": msg.user_agent,
            "created_at": msg.created_at.isoformat(),
            "read": bool(msg.read)
        }
        for msg in messages
    ]

    return {
        "total": len(messages_list),
        "messages": messages_list
    }
