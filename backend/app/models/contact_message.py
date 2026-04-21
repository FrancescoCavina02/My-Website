"""
SQLAlchemy model for contact messages.
Stores contact form submissions in the database.
"""
from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database import Base


class ContactMessageDB(Base):
    """Contact message database model."""

    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    subject = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    ip_address = Column(String(45), nullable=True)  # IPv6 max length is 45
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    read = Column(Integer, default=0)  # 0 = unread, 1 = read

    def __repr__(self):
        return f"<ContactMessage(id={self.id}, from={self.name}, subject={self.subject})>"

    def to_dict(self):
        """Convert to dictionary for API responses."""
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "subject": self.subject,
            "message": self.message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "read": bool(self.read)
        }
