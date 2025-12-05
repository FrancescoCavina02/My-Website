"""
Contact API Routes
Endpoint for contact form submissions
"""

from fastapi import APIRouter, HTTPException
import logging
from datetime import datetime

from app.models.note import ContactMessage

logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory storage for contact messages (replace with database in production)
contact_messages: list = []


@router.post("/")
async def submit_contact(message: ContactMessage):
    """
    Submit a contact form message
    
    In a production environment, this would:
    - Store in PostgreSQL database
    - Send email notification
    - Implement rate limiting
    
    For now, it stores in memory and logs.
    """
    # Log the message
    logger.info(f"Contact form submission from {message.name} ({message.email})")
    
    # Store with timestamp
    stored_message = {
        **message.model_dump(),
        "submitted_at": datetime.now().isoformat(),
        "id": len(contact_messages) + 1
    }
    contact_messages.append(stored_message)
    
    return {
        "success": True,
        "message": "Thank you for your message. I will get back to you soon."
    }


@router.get("/messages")
async def get_messages():
    """
    Get all contact messages (admin endpoint)
    
    In production, this should be protected with authentication.
    """
    return {
        "total": len(contact_messages),
        "messages": contact_messages
    }
