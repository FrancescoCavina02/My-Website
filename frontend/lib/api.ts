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

/**
 * Navigation context embedded in a Note response.
 * Uses id-based siblings/children — matches what the backend currently returns
 * inside GET /api/notes/{note_id}.
 */
export interface NoteNavigationContext {
  breadcrumbs: { id: string; title: string; file_path: string }[];
  siblings: { id: string; title: string }[];
  children: { id: string; title: string }[];
  parent?: { id: string; title: string };
  is_leaf: boolean;
  depth: number;
}

export interface Note extends NoteMetadata {
  content: string;
  links: string[];
  navigation?: NoteNavigationContext;
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

// ─── Spiritual-chatbot-style Tree Navigation Types ───────────────────────────

export interface BreadcrumbItem {
  title: string;
  file_path: string;
}

/**
 * Full navigation context as returned by GET /api/tree/navigation/{file_path}.
 * Uses file_path-based siblings/children.
 */
export interface NavigationContext {
  note: {
    id: string;
    title: string;
    file_path: string;
    category: string;
    book: string | null;
  };
  is_in_tree: boolean;
  breadcrumbs: BreadcrumbItem[];
  parent: BreadcrumbItem | null;
  siblings: BreadcrumbItem[];
  children: BreadcrumbItem[];
  is_leaf: boolean;
  depth: number;
}

export interface TreeNode {
  id: string;
  title: string;
  file_path: string;
  is_root: boolean;
  is_leaf: boolean;
  depth: number;
  children_count: number;
  wiki_links: string[];
  children: TreeNode[];
}

export interface BookMetadata {
  book_name: string;
  title: string;
  file_path: string;
  chapter_count: number;
  note_count: number;
}

export interface BookTreeResponse {
  category: string;
  book_name: string;
  tree: TreeNode;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function fetchVaultStructure(retries = 5, delayMs = 5000): Promise<VaultStructure> {
  let lastError: Error | unknown;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notes/structure`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      lastError = err;
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, delayMs));
      }
    }
  }
  throw lastError;
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

  const response = await fetch(`${API_BASE_URL}/api/notes?${params}`);
  if (!response.ok) throw new Error("Failed to fetch notes");
  return response.json();
}

export async function fetchNote(noteId: string): Promise<Note> {
  const response = await fetch(`${API_BASE_URL}/api/notes/${noteId}`);
  if (!response.ok) throw new Error("Note not found");
  return response.json();
}

export async function fetchBookTree(book: string): Promise<{
  book: string;
  has_tree: boolean;
  tree?: NoteTree;
  notes?: { id: string; title: string }[];
}> {
  const response = await fetch(`${API_BASE_URL}/api/notes/tree/${encodeURIComponent(book)}`);
  if (!response.ok) throw new Error("Failed to fetch book tree");
  return response.json();
}

export async function searchNotes(query: string, limit = 20): Promise<NoteMetadata[]> {
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

export async function fetchBooks(category?: string): Promise<string[]> {
  const params = new URLSearchParams();
  if (category) params.set("category", category);

  const response = await fetch(`${API_BASE_URL}/api/notes/books?${params}`);
  if (!response.ok) throw new Error("Failed to fetch books");
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

  const response = await fetch(`${API_BASE_URL}/api/quotes/random?${params}`);
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

// ─── Tree Navigation API (Spiritual-chatbot-compatible endpoints) ─────────────

/**
 * Get navigation context for a note by its file path.
 * Requires backend to expose GET /api/tree/navigation/{file_path}.
 */
export async function getNoteNavigation(filePath: string): Promise<NavigationContext> {
  const res = await fetch(
    `${API_BASE_URL}/api/tree/navigation/${encodeURIComponent(filePath)}`
  );
  if (!res.ok) throw new Error("Failed to fetch navigation context");
  return res.json();
}

/**
 * Get all books grouped by category.
 * Requires backend to expose GET /api/tree/books.
 */
export async function getAllBooks(): Promise<Record<string, BookMetadata[]>> {
  const res = await fetch(`${API_BASE_URL}/api/tree/books`);
  if (!res.ok) throw new Error("Failed to fetch books");
  const data = await res.json();
  return data.categories;
}

/**
 * Get full tree structure for a specific book.
 * Requires backend to expose GET /api/tree/{category}/{book_name}.
 */
export async function getBookTree(
  category: string,
  bookName: string
): Promise<BookTreeResponse> {
  const res = await fetch(
    `${API_BASE_URL}/api/tree/${encodeURIComponent(category)}/${encodeURIComponent(bookName)}`
  );
  if (!res.ok) throw new Error("Failed to fetch book tree");
  return res.json();
}
