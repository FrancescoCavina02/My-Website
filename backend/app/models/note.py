"""Pydantic models for notes"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime


class Note(BaseModel):
    """Represents a parsed Obsidian note"""
    id: str = Field(..., description="Unique identifier for the note")
    title: str = Field(..., description="Note title")
    content: str = Field(..., description="Full note content in markdown")
    category: str = Field(..., description="Category (e.g., Spiritual, Self-Help)")
    book: Optional[str] = Field(None, description="Book or source name")
    file_path: str = Field(..., description="Relative path from vault root")
    links: List[str] = Field(default_factory=list, description="Obsidian links [[Note]]")
    word_count: int = Field(..., description="Number of words in content")
    created_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "spiritual_a-new-earth_presence",
                "title": "Presence",
                "content": "There is space around my unhappiness...",
                "category": "Spiritual",
                "book": "A New Earth",
                "file_path": "Spiritual/A New Earth/files/Presence.md",
                "links": ["Ego", "Pain-Body"],
                "word_count": 150
            }
        }


class NoteMetadata(BaseModel):
    """Metadata for a note (without full content)"""
    id: str
    title: str
    category: str
    book: Optional[str] = None
    file_path: str
    word_count: int


class NoteTree(BaseModel):
    """Tree structure for note navigation"""
    id: str
    title: str
    file_path: str
    is_root: bool = False
    is_leaf: bool = False
    depth: int = 0
    children: List["NoteTree"] = Field(default_factory=list)


class NoteStats(BaseModel):
    """Statistics about the note collection"""
    total_notes: int
    categories: Dict[str, int]
    books: Dict[str, int]
    total_words: int


class Quote(BaseModel):
    """A quote extracted from notes"""
    text: str
    source: str
    book: Optional[str] = None
    category: str


class ContactMessage(BaseModel):
    """Contact form submission"""
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    subject: str = Field(..., min_length=5, max_length=200)
    message: str = Field(..., min_length=10, max_length=5000)


# Enable forward references for recursive model
NoteTree.model_rebuild()
