"use client";

import { useState, useEffect } from "react";
import { fetchRandomQuote, fetchQuoteCategories, Quote } from "@/lib/api";
import Button from "@/components/ui/Button";

export default function QuotesPage() {
    const [quote, setQuote] = useState<Quote | null>(null);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Fetch categories on mount
    useEffect(() => {
        fetchQuoteCategories()
            .then(setCategories)
            .catch(() => {
                // If backend is not running, show placeholder categories
                setCategories(["Spiritual", "Self-Help", "Science", "Philosophy"]);
            });
    }, []);

    const generateQuote = async () => {
        setIsLoading(true);
        setError(null);
        setCopied(false);

        try {
            const newQuote = await fetchRandomQuote(
                selectedCategory || undefined
            );
            setQuote(newQuote);
        } catch (err) {
            setError(
                "Could not fetch quote. Make sure the backend is running."
            );
            // Show a placeholder quote for demo purposes
            setQuote({
                text: "The only way to do great work is to love what you do.",
                source: "Placeholder",
                category: selectedCategory || "Inspiration",
                book: "Demo Quote",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (quote) {
            navigator.clipboard.writeText(`"${quote.text}" — ${quote.source}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen">
            <section className="section">
                <div className="max-w-3xl mx-auto">
                    {/* Page Header */}
                    <div className="mb-12 text-center stagger-children">
                        <h1 className="mb-4">
                            Daily <span className="text-gradient">Quotes</span>
                        </h1>
                        <p className="text-[var(--color-text-secondary)] text-lg">
                            Wisdom from my reading collection, powered by AI
                        </p>
                    </div>

                    {/* Category Selection */}
                    <div className="mb-8 text-center">
                        <label className="block text-sm text-[var(--color-text-muted)] mb-3">
                            Select a category (or leave empty for random)
                        </label>
                        <div className="flex flex-wrap justify-center gap-2">
                            <button
                                onClick={() => setSelectedCategory("")}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === ""
                                        ? "bg-[var(--color-accent-500)] text-[var(--color-space-900)]"
                                        : "bg-[var(--color-space-700)] text-[var(--color-text-secondary)] hover:bg-[var(--color-space-600)]"
                                    }`}
                            >
                                All
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat
                                            ? "bg-[var(--color-accent-500)] text-[var(--color-space-900)]"
                                            : "bg-[var(--color-space-700)] text-[var(--color-text-secondary)] hover:bg-[var(--color-space-600)]"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <div className="text-center mb-12">
                        <Button
                            onClick={generateQuote}
                            isLoading={isLoading}
                            size="lg"
                            className="min-w-48"
                        >
                            {quote ? "Generate Another" : "Generate Quote"}
                        </Button>
                    </div>

                    {/* Quote Display */}
                    {quote && (
                        <div className="card animate-fade-in-up text-center relative">
                            {/* Quote Icon */}
                            <div className="text-6xl text-[var(--color-accent-500)] opacity-30 absolute top-4 left-4">
                                &ldquo;
                            </div>

                            {/* Quote Text */}
                            <blockquote className="text-xl md:text-2xl text-[var(--color-text-primary)] leading-relaxed mb-6 pt-8 px-8">
                                {quote.text}
                            </blockquote>

                            {/* Attribution */}
                            <div className="border-t border-white/10 pt-4">
                                <p className="text-[var(--color-accent-400)] font-medium">
                                    — {quote.source}
                                </p>
                                {quote.book && (
                                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                                        from {quote.book}
                                    </p>
                                )}
                                <span className="tag mt-3">{quote.category}</span>
                            </div>

                            {/* Copy Button */}
                            <button
                                onClick={copyToClipboard}
                                className="absolute top-4 right-4 p-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent-500)] transition-colors"
                                title="Copy to clipboard"
                            >
                                {copied ? (
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="text-center text-sm text-[var(--color-text-muted)] mt-4">
                            {error}
                        </div>
                    )}

                    {/* Info */}
                    <div className="mt-12 text-center text-sm text-[var(--color-text-muted)]">
                        <p>
                            Quotes are extracted from my personal Obsidian vault containing
                            notes from books on spirituality, psychology, self-help, and
                            philosophy.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
