"""
Search Index Service

Builds an inverted index for fast note searching with TF-IDF relevance scoring.
Replaces the O(n) linear search with O(1) term lookup + O(k) scoring where k = matching docs.

TF-IDF (Term Frequency - Inverse Document Frequency):
- TF: How often a term appears in a document
- IDF: How rare the term is across all documents
- Score: TF * IDF (higher = more relevant)
"""

import re
import math
from typing import Dict, List, Set, Tuple
from collections import defaultdict
from app.models.note import Note


class SearchIndex:
    """
    Inverted index for fast full-text search with TF-IDF scoring.

    Structure:
        term -> {note_id: term_frequency}
        note_id -> {term: term_frequency}
        document_count -> int
        term_document_count -> {term: int}
    """

    def __init__(self):
        # Inverted index: term -> {note_id: term_frequency}
        self.index: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))

        # Forward index: note_id -> {term: term_frequency}
        self.documents: Dict[str, Dict[str, int]] = {}

        # Note metadata for results
        self.note_metadata: Dict[str, Dict[str, str]] = {}

        # Statistics for IDF calculation
        self.document_count: int = 0
        self.term_document_count: Dict[str, int] = defaultdict(int)

    def tokenize(self, text: str) -> List[str]:
        """
        Tokenize text into searchable terms.
        - Lowercase
        - Remove punctuation
        - Split on whitespace
        - Filter short tokens (< 2 chars)
        """
        # Convert to lowercase
        text = text.lower()

        # Remove punctuation and split
        tokens = re.findall(r'\b\w+\b', text)

        # Filter short tokens and common stop words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'was', 'are', 'be'}
        tokens = [t for t in tokens if len(t) >= 2 and t not in stop_words]

        return tokens

    def calculate_term_frequency(self, tokens: List[str]) -> Dict[str, int]:
        """Calculate term frequency for a list of tokens"""
        term_freq = defaultdict(int)
        for token in tokens:
            term_freq[token] += 1
        return dict(term_freq)

    def add_document(self, note: Note):
        """Add a note to the search index"""
        note_id = note.id

        # Tokenize title and content (title gets higher weight)
        title_tokens = self.tokenize(note.title) * 2  # Weight title 2x
        content_tokens = self.tokenize(note.content)

        all_tokens = title_tokens + content_tokens
        term_freq = self.calculate_term_frequency(all_tokens)

        # Store in forward index
        self.documents[note_id] = term_freq

        # Store metadata for search results
        self.note_metadata[note_id] = {
            "title": note.title,
            "category": note.category,
            "book": note.book or "",
            "word_count": note.word_count,
        }

        # Update inverted index
        unique_terms = set(term_freq.keys())
        for term in unique_terms:
            self.index[term][note_id] = term_freq[term]

        # Update statistics
        for term in unique_terms:
            self.term_document_count[term] += 1

        self.document_count += 1

    def calculate_idf(self, term: str) -> float:
        """
        Calculate Inverse Document Frequency for a term.
        IDF = log(total_docs / docs_containing_term)
        Higher = more rare = more discriminative
        """
        if term not in self.term_document_count or self.document_count == 0:
            return 0.0

        docs_with_term = self.term_document_count[term]
        return math.log(self.document_count / docs_with_term)

    def calculate_tfidf_score(self, note_id: str, query_terms: List[str]) -> float:
        """
        Calculate TF-IDF score for a document given query terms.
        Score = sum(TF(term) * IDF(term)) for all query terms in document
        """
        if note_id not in self.documents:
            return 0.0

        doc_terms = self.documents[note_id]
        score = 0.0

        for term in query_terms:
            if term in doc_terms:
                tf = doc_terms[term]
                idf = self.calculate_idf(term)
                score += tf * idf

        return score

    def search(self, query: str, top_k: int = 20) -> List[Tuple[str, float, Dict[str, str]]]:
        """
        Search the index and return top-k results with scores.

        Returns:
            List of (note_id, score, metadata) tuples sorted by score descending
        """
        # Tokenize query
        query_terms = self.tokenize(query)

        if not query_terms:
            return []

        # Find all documents containing at least one query term
        candidate_docs: Set[str] = set()
        for term in query_terms:
            if term in self.index:
                candidate_docs.update(self.index[term].keys())

        if not candidate_docs:
            return []

        # Score all candidate documents
        scored_docs = []
        for note_id in candidate_docs:
            score = self.calculate_tfidf_score(note_id, query_terms)
            metadata = self.note_metadata.get(note_id, {})
            scored_docs.append((note_id, score, metadata))

        # Sort by score descending and return top-k
        scored_docs.sort(key=lambda x: x[1], reverse=True)
        return scored_docs[:top_k]

    def get_stats(self) -> Dict:
        """Get index statistics for debugging"""
        return {
            "document_count": self.document_count,
            "unique_terms": len(self.index),
            "total_postings": sum(len(postings) for postings in self.index.values()),
            "avg_document_length": sum(len(terms) for terms in self.documents.values()) / max(self.document_count, 1),
        }

    @classmethod
    def build_from_notes(cls, notes: List[Note]) -> "SearchIndex":
        """Build a complete search index from a list of notes"""
        index = cls()
        for note in notes:
            index.add_document(note)
        return index
