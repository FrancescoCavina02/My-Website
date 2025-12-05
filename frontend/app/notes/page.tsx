"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    fetchNoteTree,
    fetchNotes,
    searchNotes,
    NoteTree,
    NoteMetadata,
} from "@/lib/api";

export default function NotesPage() {
    const [tree, setTree] = useState<Record<string, NoteTree[]>>({});
    const [notes, setNotes] = useState<NoteMetadata[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<NoteMetadata[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch initial data
    useEffect(() => {
        Promise.all([fetchNoteTree(), fetchNotes()])
            .then(([treeData, notesData]) => {
                setTree(treeData);
                setNotes(notesData);
                setLoading(false);
            })
            .catch(() => {
                setError("Could not load notes. Ensure the backend is running.");
                setLoading(false);
            });
    }, []);

    // Search handler
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        const timeout = setTimeout(async () => {
            setIsSearching(true);
            try {
                const results = await searchNotes(searchQuery);
                setSearchResults(results);
            } catch {
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const categories = Object.keys(tree);

    return (
        <div className="min-h-screen">
            <section className="section">
                <div className="max-w-6xl mx-auto">
                    {/* Page Header */}
                    <div className="mb-12 text-center stagger-children">
                        <h1 className="mb-4">
                            My <span className="text-gradient">Notes</span>
                        </h1>
                        <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
                            Insights and takeaways from my reading on spirituality,
                            psychology, self-help, and more
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-8 max-w-xl mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search notes..."
                                className="input pl-10"
                            />
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            {isSearching && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="w-4 h-4 border-2 border-[var(--color-accent-500)] border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search Results */}
                    {searchQuery.length >= 2 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold mb-4">
                                Search Results ({searchResults.length})
                            </h2>
                            {searchResults.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {searchResults.map((note) => (
                                        <NoteCard key={note.id} note={note} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[var(--color-text-muted)]">
                                    No notes found matching &quot;{searchQuery}&quot;
                                </p>
                            )}
                        </div>
                    )}

                    {/* Loading/Error States */}
                    {loading && (
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border-2 border-[var(--color-accent-500)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-[var(--color-text-muted)]">Loading notes...</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-12">
                            <p className="text-[var(--color-text-muted)] mb-4">{error}</p>
                            <p className="text-sm text-[var(--color-text-muted)]">
                                Run the backend with: cd backend && uvicorn app.main:app --reload
                            </p>
                        </div>
                    )}

                    {/* Notes by Category */}
                    {!loading && !error && searchQuery.length < 2 && (
                        <div className="space-y-12">
                            {categories.map((category) => (
                                <div key={category}>
                                    <h2 className="text-xl font-semibold mb-6 text-gradient">
                                        {category}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {tree[category]?.map((rootNote) => (
                                            <TreeNode key={rootNote.id} node={rootNote} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Stats */}
                    {!loading && !error && notes.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-[var(--color-text-muted)]">
                            {notes.length} notes across {categories.length} categories
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function NoteCard({ note }: { note: NoteMetadata }) {
    return (
        <Link
            href={`/notes/${note.id}`}
            className="card card-glow block"
        >
            <span className="tag mb-2">{note.category}</span>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
                {note.title}
            </h3>
            {note.book && (
                <p className="text-sm text-[var(--color-text-muted)]">
                    {note.book}
                </p>
            )}
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
                {note.word_count.toLocaleString()} words
            </p>
        </Link>
    );
}

function TreeNode({ node, depth = 0 }: { node: NoteTree; depth?: number }) {
    const [isExpanded, setIsExpanded] = useState(depth === 0);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className={depth === 0 ? "card card-glow" : ""}>
            <div
                className={`flex items-center gap-2 ${depth > 0 ? "py-1" : ""
                    }`}
            >
                {hasChildren && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-5 h-5 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-accent-500)]"
                    >
                        <svg
                            className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""
                                }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                )}
                <Link
                    href={`/notes/${node.id}`}
                    className="text-[var(--color-text-primary)] hover:text-[var(--color-accent-500)] transition-colors flex-grow"
                >
                    {node.title}
                </Link>
            </div>

            {hasChildren && isExpanded && (
                <div className="ml-5 mt-2 pl-3 border-l border-white/10 space-y-1">
                    {node.children.map((child) => (
                        <TreeNode key={child.id} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}
