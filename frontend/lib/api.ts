/**
 * API Client for Portfolio Backend
 */

function getApiBaseUrl(): string {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    const fallbackUrl = "http://localhost:8000";

    if (typeof window !== "undefined") {
        const isLocalhost =
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1";

        if (!envUrl && !isLocalhost) {
            console.warn("[API] NEXT_PUBLIC_API_URL is not set. API calls will target localhost:8000 which will fail in production. Set this variable in your Netlify dashboard.");
        }
    }

    return envUrl || fallbackUrl;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(`${getApiBaseUrl()}${path}`, {
            ...init,
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        return response.json() as Promise<T>;
    } finally {
        clearTimeout(timeoutId);
    }
}

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
    navigation?: NavigationContext;
}

export interface NavigationContext {
    breadcrumbs: { id: string; title: string; file_path: string }[];
    siblings: { id: string; title: string }[];
    children: { id: string; title: string }[];
    parent?: { id: string; title: string };
    is_leaf: boolean;
    depth: number;
}

export interface NoteTree {
    id: string;
    title: string;
    file_path: string;
    book?: string;
    is_root: boolean;
    is_leaf: boolean;
    depth: number;
    children_count: number;
    wiki_links: string[];
    children: NoteTree[];
}

export interface BookData {
    note_count: number;
    trees: NoteTree[];
    has_tree: boolean;
}

export interface CategoryData {
    note_count: number;
    book_count: number;
    books: Record<string, BookData>;
}

export interface VaultStructure {
    [category: string]: CategoryData;
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

export async function fetchVaultStructure(): Promise<VaultStructure> {
    return apiFetch<VaultStructure>("/api/notes/structure");
}

export async function fetchNotes(
    category?: string,
    book?: string,
    limit = 100
): Promise<NoteMetadata[]> {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (book) params.set("book", book);
    params.set("limit", String(limit));

    return apiFetch<NoteMetadata[]>(`/api/notes?${params}`);
}

export async function fetchNote(noteId: string): Promise<Note> {
    return apiFetch<Note>(`/api/notes/${noteId}`);
}

export async function fetchBookTree(book: string): Promise<{
    book: string;
    has_tree: boolean;
    tree?: NoteTree;
    notes?: { id: string; title: string }[];
}> {
    return apiFetch(`/api/notes/tree/${encodeURIComponent(book)}`);
}

export async function searchNotes(
    query: string,
    limit = 20
): Promise<NoteMetadata[]> {
    const params = new URLSearchParams({ q: query, limit: String(limit) });
    return apiFetch<NoteMetadata[]>(`/api/notes/search?${params}`);
}

export async function fetchNoteStats(): Promise<NoteStats> {
    return apiFetch<NoteStats>("/api/notes/stats");
}

export async function fetchCategories(): Promise<string[]> {
    return apiFetch<string[]>("/api/notes/categories");
}

export async function fetchBooks(category?: string): Promise<string[]> {
    const params = new URLSearchParams();
    if (category) params.set("category", category);

    return apiFetch<string[]>(`/api/notes/books?${params}`);
}

export async function fetchQuoteCategories(): Promise<string[]> {
    return apiFetch<string[]>("/api/quotes/categories");
}

export async function fetchRandomQuote(category?: string): Promise<Quote> {
    const params = new URLSearchParams();
    if (category) params.set("category", category);

    return apiFetch<Quote>(`/api/quotes/random?${params}`);
}

export async function submitContactForm(
    data: ContactMessage
): Promise<{ success: boolean; message: string }> {
    return apiFetch<{ success: boolean; message: string }>("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
}

export { getApiBaseUrl };
