"use client";

import { useState, useEffect } from "react";
import { fetchRandomQuote, fetchQuoteCategories, Quote } from "@/lib/api";
import { QuoteSkeleton } from "@/components/loading/NoteSkeleton";
import { Quote as QuoteIcon, Copy, Check } from "lucide-react";

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
      const newQuote = await fetchRandomQuote(selectedCategory || undefined);
      setQuote(newQuote);
    } catch {
      setError("Could not fetch quotes. The backend service may be loading.");
      // Show a placeholder quote for demo purposes
      setQuote({
        text: "The impediment to action advances action. What stands in the way becomes the way.",
        source: "Marcus Aurelius",
        category: selectedCategory || "Philosophy",
        book: "Meditations",
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
          <div className="mb-12 text-center flex flex-col items-center">
            <QuoteIcon className="w-8 h-8 text-[var(--color-accent)] mb-4 opacity-80" />
            <h1 className="mb-4 text-white">Daily Quotes</h1>
            <p className="text-[var(--color-text-secondary)] text-lg font-light">
              Wisdom from my reading collection, parsed by AI
            </p>
          </div>

          {/* Category Selection */}
          <div className="mb-8 text-center">
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setSelectedCategory("")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedCategory === ""
                    ? "bg-[var(--color-accent)] text-black"
                    : "bg-transparent border border-[rgba(255,255,255,0.1)] text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-[var(--color-accent)] text-black"
                      : "bg-transparent border border-[rgba(255,255,255,0.1)] text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button Wrapper */}
          <div className="text-center mb-12">
            <button
              onClick={generateQuote}
              disabled={isLoading}
              className="bg-[var(--color-accent)] text-black font-semibold py-3 px-8 rounded-md hover:brightness-110 flex items-center justify-center gap-2 mx-auto min-w-[200px] transition-all disabled:opacity-50"
            >
              {isLoading ? "Consulting vault..." : quote ? "Load Another Quote" : "Generate Quote"}
            </button>
          </div>

          {/* Quote Display Area */}
          <div className="min-h-[250px]">
            {isLoading ? (
              <QuoteSkeleton />
            ) : quote ? (
              <div className="card border-l-[3px] border-[var(--color-accent)] relative p-8 md:p-12 text-center animate-fade-in-up">
                {/* Quote Text */}
                <blockquote className="text-xl md:text-3xl text-white leading-relaxed mb-8 italic font-light">
                  &quot;{quote.text}&quot;
                </blockquote>

                {/* Attribution */}
                <div className="flex flex-col items-center">
                  <p className="text-[var(--color-accent)] font-semibold tracking-wider uppercase text-sm">
                    — {quote.source}
                  </p>
                  {quote.book && (
                    <p className="text-sm text-[var(--color-text-muted)] mt-1 font-mono">
                      {quote.book}
                    </p>
                  )}
                </div>

                {/* Copy Button */}
                <button
                  onClick={copyToClipboard}
                  className="absolute top-4 right-4 p-2 text-[var(--color-text-muted)] hover:text-white transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ) : (
              <div className="card flex items-center justify-center min-h-[200px] text-[var(--color-text-muted)] border-dashed border-[rgba(255,255,255,0.1)] bg-transparent">
                <p className="font-light">Select a category and generate a quote.</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="text-center text-sm text-[var(--color-text-muted)] mt-6 p-4 border border-[rgba(255,255,255,0.05)] rounded-lg bg-[rgba(255,255,255,0.02)]">
                {error}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
