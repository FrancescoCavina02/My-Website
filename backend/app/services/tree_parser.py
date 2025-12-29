"""
Tree Structure Parser for Obsidian Notes
Parses [[wiki links]] and builds hierarchical tree structures for books/videos
Adapted from NLP Chatbot project
"""

import re
from typing import List, Dict, Optional, Set
from pathlib import Path
import logging

from app.models.note import Note, NoteTree

logger = logging.getLogger(__name__)


class TreeNode:
    """Represents a node in the note tree structure"""
    
    def __init__(
        self,
        note: Note,
        is_root: bool = False,
        is_leaf: bool = False,
        depth: int = 0
    ):
        self.note = note
        self.is_root = is_root
        self.is_leaf = is_leaf
        self.depth = depth
        self.children: List[TreeNode] = []
        self.parent: Optional[TreeNode] = None
        self.wiki_links: List[str] = []
    
    def add_child(self, child: 'TreeNode'):
        """Add a child node"""
        self.children.append(child)
        child.parent = self
        child.depth = self.depth + 1
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for API response"""
        return {
            "id": self.note.id,
            "title": self.note.title,
            "file_path": self.note.file_path,
            "book": self.note.book,
            "is_root": self.is_root,
            "is_leaf": self.is_leaf,
            "depth": self.depth,
            "children_count": len(self.children),
            "wiki_links": self.wiki_links,
            "children": [child.to_dict() for child in self.children]
        }


class TreeParser:
    """Service for parsing note tree structures"""
    
    # Pattern to match [[wiki links]]
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
        Check if a note is a root note (table of contents for a book)
        
        A root note is identified by:
        1. Filename contains "notes" (case-insensitive)
        2. Located in book folder root (not in /files or /zfiles subfolder)
        3. Typically shorter and mostly contains [[links]]
        """
        filename = Path(note.file_path).name.lower()
        parent_dir = Path(note.file_path).parent.name.lower()
        
        # Must contain "notes" in filename
        if "notes" not in filename:
            return False
        
        # Should NOT be in a subfolder like "files" or "zfiles"
        if parent_dir in ["files", "zfiles", "file"]:
            return False
        
        # Additional heuristic: root notes typically have many [[links]] and short content
        wiki_links = self.extract_wiki_links(note.content)
        
        if len(wiki_links) >= 2 and len(note.content) < 1500:
            return True
        
        # Fallback: if filename starts with "notes" or "a " pattern
        if filename.startswith("notes ") or filename.startswith("notes-") or filename.startswith("a "):
            return True
        
        return False
    
    def find_note_by_link_text(self, link_text: str, base_category: str, base_book: Optional[str] = None) -> Optional[Note]:
        """
        Find a note by its [[wiki link]] text
        
        Strategy:
        1. Try exact title match
        2. Try case-insensitive title match in same category/book
        3. Try partial match in same category/book
        4. Try filename match
        """
        link_text_clean = link_text.strip()
        link_text_lower = link_text_clean.lower()
        
        # Strategy 1: Exact title match
        if link_text_clean in self.notes_by_title:
            return self.notes_by_title[link_text_clean]
        
        # Strategy 2: Case-insensitive search in same book first
        if base_book:
            for note in self.notes_by_id.values():
                if note.book == base_book and note.title.lower() == link_text_lower:
                    return note
        
        # Strategy 3: Case-insensitive search in same category
        for note in self.notes_by_id.values():
            if note.category == base_category:
                if note.title.lower() == link_text_lower:
                    return note
        
        # Strategy 4: Partial match (link text contained in title)
        if base_book:
            for note in self.notes_by_id.values():
                if note.book == base_book:
                    if link_text_lower in note.title.lower():
                        return note
        
        for note in self.notes_by_id.values():
            if note.category == base_category:
                if link_text_lower in note.title.lower():
                    return note
        
        # Strategy 5: Check if it's a filename
        for file_path, note in self.notes_by_filepath.items():
            filename = Path(file_path).stem
            if filename.lower() == link_text_lower:
                if note.category == base_category:
                    return note
        
        logger.debug(f"Could not find note for link: '{link_text}' in category '{base_category}'")
        return None
    
    def build_tree(self, root_note: Note, all_notes: List[Note]) -> TreeNode:
        """Build a tree structure starting from a root note"""
        # Index notes for fast lookup
        self.notes_by_id = {note.id: note for note in all_notes}
        self.notes_by_title = {note.title: note for note in all_notes}
        self.notes_by_filepath = {note.file_path: note for note in all_notes}
        
        # Create root node
        root = TreeNode(note=root_note, is_root=True, depth=0)
        
        # Track visited notes to avoid cycles
        visited: Set[str] = {root_note.id}
        
        # Recursively build tree
        self._build_tree_recursive(root, root_note.category, root_note.book, visited)
        
        return root
    
    def _build_tree_recursive(
        self,
        parent_node: TreeNode,
        category: str,
        book: Optional[str],
        visited: Set[str]
    ):
        """Recursively build tree by following [[wiki links]]"""
        # Extract wiki links from parent note
        wiki_links = self.extract_wiki_links(parent_node.note.content)
        parent_node.wiki_links = wiki_links
        
        # If no links, this is a leaf
        if not wiki_links:
            parent_node.is_leaf = True
            return
        
        # Process each link
        for link_text in wiki_links:
            # Find the note for this link
            child_note = self.find_note_by_link_text(link_text, category, book)
            
            if child_note is None:
                logger.debug(f"Skipping unresolved link: {link_text}")
                continue
            
            # Avoid cycles
            if child_note.id in visited:
                logger.debug(f"Skipping already visited note: {child_note.title}")
                continue
            
            visited.add(child_note.id)
            
            # Create child node
            child_node = TreeNode(
                note=child_note,
                is_root=False,
                depth=parent_node.depth + 1
            )
            
            # Add to tree
            parent_node.add_child(child_node)
            
            # Recursively process children
            self._build_tree_recursive(child_node, category, book, visited)
    
    def find_root_notes(self, notes: List[Note]) -> List[Note]:
        """Find all root notes in a list"""
        return [note for note in notes if self.is_root_note(note)]
    
    def find_root_notes_for_book(self, notes: List[Note], book: str) -> List[Note]:
        """Find root notes for a specific book"""
        book_notes = [n for n in notes if n.book == book]
        return self.find_root_notes(book_notes)
    
    def build_category_structure(self, notes: List[Note]) -> Dict:
        """
        Build structured data organized by category -> book -> tree
        
        Returns:
            Dictionary with categories, books, and tree structures
        """
        # Group notes by category and book
        categories_data = {}
        
        # Get unique categories
        categories = set(n.category for n in notes)
        
        for category in sorted(categories):
            category_notes = [n for n in notes if n.category == category]
            books = set(n.book for n in category_notes if n.book)
            
            books_data = {}
            for book in sorted(books):
                book_notes = [n for n in category_notes if n.book == book]
                root_notes = self.find_root_notes(book_notes)
                
                # If no root notes found, use the first note as fallback
                # This ensures every book has at least one tree/entry point
                if not root_notes and book_notes:
                    # Prefer notes with more wiki links (likely table of contents)
                    book_notes_sorted = sorted(
                        book_notes,
                        key=lambda n: len(self.extract_wiki_links(n.content)),
                        reverse=True
                    )
                    root_notes = [book_notes_sorted[0]]
                    logger.info(f"No root note found for '{book}', using '{root_notes[0].title}' as fallback")
                
                # Build tree for each root note
                trees = []
                for root_note in root_notes:
                    tree = self.build_tree(root_note, notes)
                    trees.append(tree.to_dict())
                
                books_data[book] = {
                    "note_count": len(book_notes),
                    "trees": trees,
                    "has_tree": len(trees) > 0
                }
            
            categories_data[category] = {
                "note_count": len(category_notes),
                "book_count": len(books),
                "books": books_data
            }
        
        return categories_data
    
    def get_navigation_context(self, note: Note, tree: TreeNode) -> Dict:
        """Get navigation context for a note (breadcrumbs, siblings, etc.)"""
        # Find the node in the tree
        node = self._find_node_in_tree(tree, note.id)
        
        if node is None:
            return {
                "breadcrumbs": [],
                "siblings": [],
                "children": [],
                "parent": None
            }
        
        # Build breadcrumbs (path from root to this node)
        breadcrumbs = []
        current = node
        while current is not None:
            breadcrumbs.insert(0, {
                "id": current.note.id,
                "title": current.note.title,
                "file_path": current.note.file_path
            })
            current = current.parent
        
        # Get siblings (other children of parent)
        siblings = []
        if node.parent:
            siblings = [
                {"id": child.note.id, "title": child.note.title}
                for child in node.parent.children
                if child.note.id != note.id
            ]
        
        # Get children
        children = [
            {"id": child.note.id, "title": child.note.title}
            for child in node.children
        ]
        
        # Get parent
        parent = None
        if node.parent:
            parent = {
                "id": node.parent.note.id,
                "title": node.parent.note.title
            }
        
        return {
            "breadcrumbs": breadcrumbs,
            "siblings": siblings,
            "children": children,
            "parent": parent,
            "is_leaf": node.is_leaf,
            "depth": node.depth
        }
    
    def _find_node_in_tree(self, tree: TreeNode, note_id: str) -> Optional[TreeNode]:
        """Find a node in the tree by note ID"""
        if tree.note.id == note_id:
            return tree
        
        for child in tree.children:
            result = self._find_node_in_tree(child, note_id)
            if result:
                return result
        
        return None


# Global instance
_tree_parser: Optional[TreeParser] = None


def get_tree_parser() -> TreeParser:
    """Get or create the global tree parser instance"""
    global _tree_parser
    if _tree_parser is None:
        _tree_parser = TreeParser()
    return _tree_parser
