"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
    fetchVaultStructure,
    fetchNote,
    searchNotes,
    VaultStructure,
    Note,
    NoteMetadata,
} from "@/lib/api";

type ViewLevel = "categories" | "books" | "note";

// State stored in browser history for back/forward navigation
interface NavigationState {
    viewLevel: ViewLevel;
    selectedCategory: string | null;
    selectedBook: string | null;
    noteId: string | null;
    noteHistoryIds: string[];
}

export default function NotesPage() {
    const searchParams = useSearchParams();

    const [structure, setStructure] = useState<VaultStructure>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Navigation history stack for proper back navigation
    const [noteHistory, setNoteHistory] = useState<Note[]>([]);

    // Current view state
    const [viewLevel, setViewLevel] = useState<ViewLevel>("categories");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedBook, setSelectedBook] = useState<string | null>(null);
    const [currentNote, setCurrentNote] = useState<Note | null>(null);
    const [noteLoading, setNoteLoading] = useState(false);

    // Search
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<NoteMetadata[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Flag to prevent pushState during popstate handling
    const [isRestoringState, setIsRestoringState] = useState(false);

    // Push navigation state to browser history
    const pushNavigationState = useCallback((state: NavigationState, replace = false) => {
        if (isRestoringState) return; // Don't push state while handling popstate

        const historyState = { notesNav: state };
        if (replace) {
            window.history.replaceState(historyState, "");
        } else {
            window.history.pushState(historyState, "");
        }
    }, [isRestoringState]);

    // Handle browser back/forward buttons
    useEffect(() => {
        const handlePopState = async (event: PopStateEvent) => {
            const state = event.state?.notesNav as NavigationState | undefined;

            if (!state) {
                // No state means we're at the initial page load - reset to categories
                setViewLevel("categories");
                setSelectedCategory(null);
                setSelectedBook(null);
                setCurrentNote(null);
                setNoteHistory([]);
                setSearchQuery("");
                return;
            }

            setIsRestoringState(true);

            // Restore the navigation state
            setViewLevel(state.viewLevel);
            setSelectedCategory(state.selectedCategory);
            setSelectedBook(state.selectedBook);
            setSearchQuery("");

            // Restore note history and current note if needed
            if (state.noteId) {
                setNoteLoading(true);
                try {
                    // Fetch current note
                    const note = await fetchNote(state.noteId);
                    setCurrentNote(note);

                    // Restore note history
                    if (state.noteHistoryIds.length > 0) {
                        const historyNotes = await Promise.all(
                            state.noteHistoryIds.map(id => fetchNote(id))
                        );
                        setNoteHistory(historyNotes);
                    } else {
                        setNoteHistory([]);
                    }
                } catch (err) {
                    console.error("Failed to restore note:", err);
                    setCurrentNote(null);
                    setNoteHistory([]);
                } finally {
                    setNoteLoading(false);
                }
            } else {
                // No note to load - make sure we clear note state and loading
                setCurrentNote(null);
                setNoteHistory([]);
                setNoteLoading(false);
            }

            setIsRestoringState(false);
        };

        window.addEventListener("popstate", handlePopState);

        // Set initial state on mount (replace, don't push)
        const initialState: NavigationState = {
            viewLevel: "categories",
            selectedCategory: null,
            selectedBook: null,
            noteId: null,
            noteHistoryIds: [],
        };
        window.history.replaceState({ notesNav: initialState }, "");

        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    // Reset to main view when URL changes to /notes (clicking Notes in menu)
    // Skip this if we're in the middle of restoring popstate
    useEffect(() => {
        // Don't interfere with popstate restoration
        if (isRestoringState) return;

        // Check if we should reset - when there are no search params
        const shouldReset = !searchParams.has("note") && !searchParams.has("book");
        if (shouldReset && (currentNote || selectedBook || selectedCategory)) {
            // Only reset if we came from somewhere
            resetToCategories();
        }
    }, [searchParams, isRestoringState]);

    // Reset function - just resets state, doesn't push to history
    const resetToCategories = useCallback(() => {
        setViewLevel("categories");
        setSelectedCategory(null);
        setSelectedBook(null);
        setCurrentNote(null);
        setNoteHistory([]);
        setSearchQuery("");
    }, []);

    // Fetch vault structure
    useEffect(() => {
        fetchVaultStructure()
            .then((data) => {
                setStructure(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Could not load notes. Make sure the backend is running.");
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

    // Handle category click
    const handleCategoryClick = (category: string) => {
        setSelectedCategory(category);
        setViewLevel("books");
        setSelectedBook(null);
        setCurrentNote(null);
        setNoteHistory([]);

        // Push state to browser history
        pushNavigationState({
            viewLevel: "books",
            selectedCategory: category,
            selectedBook: null,
            noteId: null,
            noteHistoryIds: [],
        });
    };

    // Handle book click - load the root note directly
    const handleBookClick = async (book: string) => {
        setSelectedBook(book);
        setViewLevel("note");
        setNoteLoading(true);
        setNoteHistory([]);

        try {
            const bookData = structure[selectedCategory!]?.books[book];
            if (bookData?.trees?.[0]?.id) {
                const note = await fetchNote(bookData.trees[0].id);
                setCurrentNote(note);

                // Push state to browser history
                pushNavigationState({
                    viewLevel: "note",
                    selectedCategory: selectedCategory,
                    selectedBook: book,
                    noteId: note.id,
                    noteHistoryIds: [],
                });
            } else {
                setCurrentNote(null);
            }
        } catch (err) {
            console.error("Failed to load note:", err);
            setCurrentNote(null);
        } finally {
            setNoteLoading(false);
        }
    };

    // Navigate to a note (from [[wiki link]] or child)
    const navigateToNote = async (noteId: string) => {
        setNoteLoading(true);

        // Build new history including current note
        const newHistory = currentNote ? [...noteHistory, currentNote] : noteHistory;

        // Push current note to history before navigating
        if (currentNote) {
            setNoteHistory(newHistory);
        }

        try {
            const note = await fetchNote(noteId);
            setCurrentNote(note);

            // Push state to browser history
            pushNavigationState({
                viewLevel: "note",
                selectedCategory: selectedCategory,
                selectedBook: selectedBook,
                noteId: note.id,
                noteHistoryIds: newHistory.map(n => n.id),
            });
        } catch (err) {
            console.error("Failed to load note:", err);
        } finally {
            setNoteLoading(false);
        }
    };

    // Handle wiki link click
    const handleWikiLinkClick = async (linkText: string) => {
        try {
            const results = await searchNotes(linkText);
            if (results.length > 0) {
                // Prefer exact match in same book
                const exactMatch = results.find(
                    (r) => r.title.toLowerCase() === linkText.toLowerCase() &&
                        r.book === currentNote?.book
                ) || results.find(
                    (r) => r.title.toLowerCase() === linkText.toLowerCase()
                ) || results[0];

                await navigateToNote(exactMatch.id);
            }
        } catch (err) {
            console.error("Failed to navigate:", err);
        }
    };

    // Go back - use browser history so popstate handler restores the state
    const handleBack = () => {
        window.history.back();
    };

    const categories = Object.keys(structure);

    return (
        <div className="min-h-screen">
            <section className="section">
                <div className="max-w-5xl mx-auto">
                    {/* Page Header */}
                    <div className="mb-6 text-center">
                        <h1 className="mb-2">
                            My <span className="text-gradient">Notes</span>
                        </h1>
                        <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
                            Insights from my reading collection
                        </p>
                    </div>

                    {/* Breadcrumb Navigation */}
                    <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm bg-[var(--color-space-800)] rounded-lg px-4 py-3">
                        <button
                            onClick={resetToCategories}
                            className={`${viewLevel === "categories" && !currentNote
                                ? "text-[var(--color-accent-500)]"
                                : "text-[var(--color-text-muted)] hover:text-[var(--color-accent-500)]"
                                }`}
                        >
                            📚 All Categories
                        </button>

                        {selectedCategory && (
                            <>
                                <span className="text-[var(--color-text-muted)]">›</span>
                                <button
                                    onClick={() => {
                                        setViewLevel("books");
                                        setSelectedBook(null);
                                        setCurrentNote(null);
                                        setNoteHistory([]);
                                    }}
                                    className={`${viewLevel === "books" && !currentNote
                                        ? "text-[var(--color-accent-500)]"
                                        : "text-[var(--color-text-muted)] hover:text-[var(--color-accent-500)]"
                                        }`}
                                >
                                    {selectedCategory}
                                </button>
                            </>
                        )}

                        {selectedBook && (
                            <>
                                <span className="text-[var(--color-text-muted)]">›</span>
                                <button
                                    onClick={() => handleBookClick(selectedBook)}
                                    className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-500)]"
                                >
                                    {selectedBook}
                                </button>
                            </>
                        )}

                        {currentNote && (
                            <>
                                <span className="text-[var(--color-text-muted)]">›</span>
                                <span className="text-[var(--color-accent-500)]">
                                    {currentNote.title}
                                </span>
                            </>
                        )}
                    </nav>

                    {/* Search Bar */}
                    <div className="mb-6 max-w-xl mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search notes..."
                                className="input pl-12"
                            />
                            <svg
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]"
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
                        </div>
                    </div>

                    {/* Search Results */}
                    {searchQuery.length >= 2 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold mb-4">
                                Results ({searchResults.length})
                            </h2>
                            {searchResults.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {searchResults.map((note) => (
                                        <button
                                            key={note.id}
                                            onClick={async () => {
                                                setSelectedCategory(note.category);
                                                setSelectedBook(note.book || null);
                                                setViewLevel("note");
                                                setNoteHistory([]);
                                                setNoteLoading(true);
                                                const fullNote = await fetchNote(note.id);
                                                setCurrentNote(fullNote);
                                                setNoteLoading(false);
                                                setSearchQuery("");

                                                // Push state to browser history
                                                pushNavigationState({
                                                    viewLevel: "note",
                                                    selectedCategory: note.category,
                                                    selectedBook: note.book || null,
                                                    noteId: fullNote.id,
                                                    noteHistoryIds: [],
                                                });
                                            }}
                                            className="card card-glow text-left"
                                        >
                                            <div className="flex items-start gap-2">
                                                <span className="tag text-xs">{note.category}</span>
                                                {note.book && (
                                                    <span className="text-xs text-[var(--color-text-muted)]">
                                                        {note.book}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-[var(--color-text-primary)] mt-2">
                                                {note.title}
                                            </h3>
                                            <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                                {note.word_count} words
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            ) : !isSearching ? (
                                <p className="text-[var(--color-text-muted)]">No results</p>
                            ) : null}
                        </div>
                    )}

                    {/* Loading/Error */}
                    {loading && (
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border-2 border-[var(--color-accent-500)] border-t-transparent rounded-full animate-spin mx-auto" />
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-12 text-[var(--color-text-muted)]">
                            {error}
                        </div>
                    )}

                    {/* Main Content */}
                    {!loading && !error && searchQuery.length < 2 && (
                        <>
                            {/* Categories Grid */}
                            {viewLevel === "categories" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {categories.map((category) => {
                                        const data = structure[category];
                                        const icons: Record<string, string> = {
                                            Spiritual: "🔮",
                                            "Self-Help": "📈",
                                            Science: "🔬",
                                            Psychology: "🧠",
                                            Philosophy: "💭",
                                            General: "📚",
                                            Mathematics: "🔢",
                                            Fiction: "📖",
                                            Podcast: "🎙️",
                                            "Huberman Lab": "🧪",
                                            "YouTube Videos": "🎬",
                                        };
                                        return (
                                            <button
                                                key={category}
                                                onClick={() => handleCategoryClick(category)}
                                                className="card card-glow text-left group p-6"
                                            >
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="text-3xl">
                                                        {icons[category] || "📖"}
                                                    </span>
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-gradient">
                                                            {category}
                                                        </h3>
                                                        <p className="text-sm text-[var(--color-text-muted)]">
                                                            {data.book_count} books
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Books Grid */}
                            {viewLevel === "books" && selectedCategory && (
                                <div>
                                    <button
                                        onClick={() => {
                                            setViewLevel("categories");
                                            setSelectedCategory(null);
                                        }}
                                        className="mb-4 flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-500)]"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Back to categories
                                    </button>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Object.entries(structure[selectedCategory]?.books || {}).map(
                                            ([book, data]) => (
                                                <button
                                                    key={book}
                                                    onClick={() => handleBookClick(book)}
                                                    className="card card-glow text-left group p-5"
                                                >
                                                    <h3 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-500)] transition-colors mb-1">
                                                        {book}
                                                    </h3>
                                                    <p className="text-sm text-[var(--color-text-muted)]">
                                                        {data.note_count} notes
                                                    </p>
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Note Content View */}
                            {viewLevel === "note" && (
                                <div>
                                    {/* Back Button */}
                                    <button
                                        onClick={handleBack}
                                        className="mb-4 flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-500)]"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        {noteHistory.length > 0
                                            ? `Back to ${noteHistory[noteHistory.length - 1].title}`
                                            : `Back to ${selectedBook || 'books'}`
                                        }
                                    </button>

                                    {noteLoading ? (
                                        <div className="text-center py-12">
                                            <div className="w-8 h-8 border-2 border-[var(--color-accent-500)] border-t-transparent rounded-full animate-spin mx-auto" />
                                        </div>
                                    ) : currentNote ? (
                                        <div className="card">
                                            {/* Note Header */}
                                            <div className="mb-6 pb-4 border-b border-white/10">
                                                <h2 className="text-2xl font-bold text-gradient mb-2">
                                                    {currentNote.title}
                                                </h2>
                                                <p className="text-sm text-[var(--color-text-muted)]">
                                                    {currentNote.word_count.toLocaleString()} words
                                                </p>
                                            </div>

                                            {/* Note Content */}
                                            <article className="prose prose-invert max-w-none">
                                                <NoteContent
                                                    content={currentNote.content}
                                                    onLinkClick={handleWikiLinkClick}
                                                />
                                            </article>

                                            {/* Children/Chapters */}
                                            {currentNote.navigation?.children &&
                                                currentNote.navigation.children.length > 0 && (
                                                    <div className="mt-8 pt-6 border-t border-white/10">
                                                        <h3 className="text-lg font-semibold mb-4 text-[var(--color-text-primary)]">
                                                            Continue Reading
                                                        </h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {currentNote.navigation.children.map((child) => (
                                                                <button
                                                                    key={child.id}
                                                                    onClick={() => navigateToNote(child.id)}
                                                                    className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-space-700)] hover:bg-[var(--color-space-600)] transition-colors group text-left"
                                                                >
                                                                    <span className="text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-500)]">
                                                                        {child.title}
                                                                    </span>
                                                                    <svg
                                                                        className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-500)] group-hover:translate-x-1 transition-all flex-shrink-0"
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
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-[var(--color-text-muted)]">
                                            No content found for this book.
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}

// Note content renderer with clickable wiki links
function NoteContent({
    content,
    onLinkClick,
}: {
    content: string;
    onLinkClick: (linkText: string) => void;
}) {
    if (!content || content.trim() === "") {
        return (
            <p className="text-[var(--color-text-muted)] italic">
                This note has no content.
            </p>
        );
    }

    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeContent = "";

    lines.forEach((line, index) => {
        // Code blocks
        if (line.startsWith("```")) {
            if (!inCodeBlock) {
                inCodeBlock = true;
                codeContent = "";
            } else {
                inCodeBlock = false;
                elements.push(
                    <pre
                        key={index}
                        className="bg-[var(--color-space-700)] p-4 rounded-lg overflow-x-auto my-4"
                    >
                        <code className="text-sm font-mono text-[var(--color-text-secondary)]">
                            {codeContent}
                        </code>
                    </pre>
                );
            }
            return;
        }

        if (inCodeBlock) {
            codeContent += line + "\n";
            return;
        }

        // Headings
        if (line.startsWith("### ")) {
            elements.push(
                <h3 key={index} className="text-xl font-semibold mt-6 mb-3 text-[var(--color-text-primary)]">
                    {renderInlineContent(line.slice(4), onLinkClick)}
                </h3>
            );
            return;
        }
        if (line.startsWith("## ")) {
            elements.push(
                <h2 key={index} className="text-2xl font-semibold mt-8 mb-4 text-gradient">
                    {renderInlineContent(line.slice(3), onLinkClick)}
                </h2>
            );
            return;
        }
        if (line.startsWith("# ")) {
            elements.push(
                <h1 key={index} className="text-3xl font-bold mt-8 mb-4 text-[var(--color-text-primary)]">
                    {renderInlineContent(line.slice(2), onLinkClick)}
                </h1>
            );
            return;
        }

        // Blockquotes
        if (line.startsWith("> ")) {
            elements.push(
                <blockquote key={index} className="border-l-4 border-[var(--color-accent-500)] pl-4 my-4 italic text-[var(--color-text-secondary)]">
                    {renderInlineContent(line.slice(2), onLinkClick)}
                </blockquote>
            );
            return;
        }

        // List items
        if (line.match(/^[-*]\s/)) {
            elements.push(
                <li key={index} className="ml-4 text-[var(--color-text-secondary)]">
                    {renderInlineContent(line.slice(2), onLinkClick)}
                </li>
            );
            return;
        }

        // Numbered lists
        if (line.match(/^\d+\.\s/)) {
            elements.push(
                <li key={index} className="ml-4 text-[var(--color-text-secondary)] list-decimal">
                    {renderInlineContent(line.replace(/^\d+\.\s/, ""), onLinkClick)}
                </li>
            );
            return;
        }

        // Empty lines
        if (line.trim() === "") {
            elements.push(<div key={index} className="h-3" />);
            return;
        }

        // Regular paragraphs
        elements.push(
            <p key={index} className="my-2 text-[var(--color-text-secondary)] leading-relaxed">
                {renderInlineContent(line, onLinkClick)}
            </p>
        );
    });

    return <div>{elements}</div>;
}

// Render inline content with clickable wiki links
function renderInlineContent(
    text: string,
    onLinkClick: (linkText: string) => void
): React.ReactNode {
    const wikiLinkPattern = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = wikiLinkPattern.exec(text)) !== null) {
        // Add text before the link
        if (match.index > lastIndex) {
            parts.push(
                <span key={`text-${lastIndex}`}>
                    {formatInlineText(text.slice(lastIndex, match.index))}
                </span>
            );
        }

        // Add clickable wiki link
        const linkTarget = match[1];
        const displayText = match[2] || match[1]; // Use alias if present, otherwise use link target

        parts.push(
            <button
                key={`link-${match.index}`}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onLinkClick(linkTarget);
                }}
                className="text-[var(--color-accent-500)] hover:text-[var(--color-accent-400)] hover:underline cursor-pointer font-medium"
            >
                {displayText}
            </button>
        );

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(
            <span key={`text-${lastIndex}`}>{formatInlineText(text.slice(lastIndex))}</span>
        );
    }

    return parts.length > 0 ? parts : formatInlineText(text);
}

// Format bold, italic, and inline code
function formatInlineText(text: string): React.ReactNode {
    let result = text
        .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-[var(--color-text-primary)]">$1</strong>')
        .replace(/\*([^*]+)\*/g, "<em>$1</em>")
        .replace(/`([^`]+)`/g, '<code class="bg-[var(--color-space-700)] px-1 py-0.5 rounded text-sm font-mono text-[var(--color-accent-400)]">$1</code>');

    return <span dangerouslySetInnerHTML={{ __html: result }} />;
}
