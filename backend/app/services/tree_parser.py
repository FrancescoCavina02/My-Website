"""
Tree Structure Parser for Obsidian Notes
Parses [[wiki links]] and builds hierarchical tree structures
Adapted from NLP Chatbot project
"""

import re
from typing import List, Dict, Optional, Set
from pathlib import Path
import logging

from app.models.note import Note, NoteTree

logger = logging.getLogger(__name__)


class TreeParser:
    """Service for parsing note tree structures"""
    
    WIKI_LINK_PATTERN = re.compile(r'\[\[([^\]]+)\]\]')
    
    def __init__(self):
        """Initialize tree parser"""
        self.notes_by_id: Dict[str, Note] = {}
        self.notes_by_title: Dict[str, Note] = {}
        self.notes_by_filepath: Dict[str, Note] = {}
    
    def extract_wiki_links(self, content: str) -> List[str]:
        """Extract all [[wiki links]] from markdown content"""
        matches = self.WIKI_LINK_PATTERN.findall(content)
        return [match.strip() for match in matches]
    
    def is_root_note(self, note: Note) -> bool:
        """
        Check if a note is a root note (table of contents)
        
        Root notes are identified by:
        1. Filename contains "notes" (case-insensitive)
        2. Not in /files or /zfiles subfolder
        3. Typically shorter with many [[links]]
        """
        filename = Path(note.file_path).name.lower()
        parent_dir = Path(note.file_path).parent.name.lower()
        
        if "notes" not in filename:
            return False
        
        if parent_dir in ["files", "zfiles", "file"]:
            return False
        
        wiki_links = self.extract_wiki_links(note.content)
        
        if len(wiki_links) >= 2 and len(note.content) < 1000:
            return True
        
        if filename.startswith("notes ") or filename.startswith("notes-") or filename.startswith("a "):
            return True
        
        return False
    
    def find_note_by_link_text(self, link_text: str, base_category: str) -> Optional[Note]:
        """Find a note by its [[wiki link]] text"""
        link_text_clean = link_text.strip()
        link_text_lower = link_text_clean.lower()
        
        # Strategy 1: Exact title match
        if link_text_clean in self.notes_by_title:
            return self.notes_by_title[link_text_clean]
        
        # Strategy 2: Case-insensitive in same category
        for note in self.notes_by_id.values():
            if note.category == base_category:
                if note.title.lower() == link_text_lower:
                    return note
        
        # Strategy 3: Partial match
        for note in self.notes_by_id.values():
            if note.category == base_category:
                if link_text_lower in note.title.lower():
                    return note
        
        return None
    
    def build_tree(self, root_note: Note, all_notes: List[Note]) -> NoteTree:
        """Build a tree structure starting from a root note"""
        self.notes_by_id = {note.id: note for note in all_notes}
        self.notes_by_title = {note.title: note for note in all_notes}
        self.notes_by_filepath = {note.file_path: note for note in all_notes}
        
        visited: Set[str] = {root_note.id}
        
        root = NoteTree(
            id=root_note.id,
            title=root_note.title,
            file_path=root_note.file_path,
            is_root=True,
            depth=0,
            children=[]
        )
        
        self._build_tree_recursive(root, root_note, visited)
        
        return root
    
    def _build_tree_recursive(
        self,
        parent_node: NoteTree,
        parent_note: Note,
        visited: Set[str]
    ):
        """Recursively build tree by following [[wiki links]]"""
        wiki_links = self.extract_wiki_links(parent_note.content)
        
        if not wiki_links:
            parent_node.is_leaf = True
            return
        
        for link_text in wiki_links:
            child_note = self.find_note_by_link_text(link_text, parent_note.category)
            
            if child_note is None:
                continue
            
            if child_note.id in visited:
                continue
            
            visited.add(child_note.id)
            
            child_node = NoteTree(
                id=child_note.id,
                title=child_note.title,
                file_path=child_note.file_path,
                is_root=False,
                depth=parent_node.depth + 1,
                children=[]
            )
            
            parent_node.children.append(child_node)
            self._build_tree_recursive(child_node, child_note, visited)
    
    def find_root_notes(self, notes: List[Note]) -> List[Note]:
        """Find all root notes in a list"""
        return [note for note in notes if self.is_root_note(note)]
    
    def build_category_tree(self, notes: List[Note]) -> Dict[str, List[NoteTree]]:
        """
        Build trees organized by category
        
        Returns:
            Dictionary mapping category name to list of trees
        """
        # Group notes by category
        by_category: Dict[str, List[Note]] = {}
        for note in notes:
            if note.category not in by_category:
                by_category[note.category] = []
            by_category[note.category].append(note)
        
        # Build trees for each category
        result: Dict[str, List[NoteTree]] = {}
        
        for category, category_notes in by_category.items():
            root_notes = self.find_root_notes(category_notes)
            trees = []
            
            for root_note in root_notes:
                tree = self.build_tree(root_note, notes)
                trees.append(tree)
            
            result[category] = trees
        
        return result


# Global instance
_tree_parser: Optional[TreeParser] = None


def get_tree_parser() -> TreeParser:
    """Get or create the global tree parser instance"""
    global _tree_parser
    if _tree_parser is None:
        _tree_parser = TreeParser()
    return _tree_parser
