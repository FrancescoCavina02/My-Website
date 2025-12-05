/**
 * API Client for Portfolio Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Types
export interface NoteMetadata {
    id: string;
    title: string;
    category: string;
    book?: string;
    file_path: string;
    word_count: number;
}

export interface Note extends NoteMetadata {
    content: string;
    links: string[];
    created_at: string;
}

export interface NoteTree {
    id: string;
    title: string;
    file_path: string;
    is_root: boolean;
    is_leaf: boolean;
    depth: number;
    children: NoteTree[];
}

export interface Quote {
    text: string;
    source: string;
    book?: string;
    category: string;
}

export interface ContactMessage {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export interface NoteStats {
    total_notes: number;
    categories: Record<string, number>;
    books: Record<string, number>;
    total_words: number;
}

// API Functions
export async function fetchNotes(
    category?: string,
    limit = 100
): Promise<NoteMetadata[]> {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    params.set("limit", String(limit));

    const response = await fetch(`${API_BASE_URL}/api/notes?${params}`);
    if (!response.ok) throw new Error("Failed to fetch notes");
    return response.json();
}

export async function fetchNote(noteId: string): Promise<Note> {
    const response = await fetch(`${API_BASE_URL}/api/notes/${noteId}`);
    if (!response.ok) throw new Error("Note not found");
    return response.json();
}

export async function fetchNoteTree(): Promise<Record<string, NoteTree[]>> {
    const response = await fetch(`${API_BASE_URL}/api/notes/tree`);
    if (!response.ok) throw new Error("Failed to fetch note tree");
    return response.json();
}

export async function searchNotes(
    query: string,
    limit = 20
): Promise<NoteMetadata[]> {
    const params = new URLSearchParams({ q: query, limit: String(limit) });
    const response = await fetch(`${API_BASE_URL}/api/notes/search?${params}`);
    if (!response.ok) throw new Error("Search failed");
    return response.json();
}

export async function fetchNoteStats(): Promise<NoteStats> {
    const response = await fetch(`${API_BASE_URL}/api/notes/stats`);
    if (!response.ok) throw new Error("Failed to fetch stats");
    return response.json();
}

export async function fetchCategories(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/api/notes/categories`);
    if (!response.ok) throw new Error("Failed to fetch categories");
    return response.json();
}

export async function fetchQuoteCategories(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/api/quotes/categories`);
    if (!response.ok) throw new Error("Failed to fetch quote categories");
    return response.json();
}

export async function fetchRandomQuote(category?: string): Promise<Quote> {
    const params = new URLSearchParams();
    if (category) params.set("category", category);

    const response = await fetch(
        `${API_BASE_URL}/api/quotes/random?${params}`
    );
    if (!response.ok) throw new Error("Failed to fetch quote");
    return response.json();
}

export async function submitContactForm(
    data: ContactMessage
): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to submit contact form");
    return response.json();
}
