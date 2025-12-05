"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchNote, Note } from "@/lib/api";

export default function NotePage() {
    const params = useParams();
    const slug = params.slug as string;
    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;

        fetchNote(slug)
            .then((data) => {
                setNote(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Could not load note. Make sure the backend is running.");
                setLoading(false);
            });
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[var(--color-accent-500)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !note) {
        return (
            <div className="min-h-screen">
                <section className="section text-center">
                    <h1 className="text-2xl mb-4">Note Not Found</h1>
                    <p className="text-[var(--color-text-muted)] mb-8">
                        {error || "The requested note could not be found."}
                    </p>
                    <Link href="/notes" className="btn btn-secondary">
                        Back to Notes
                    </Link>
                </section>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <section className="section">
                <div className="max-w-3xl mx-auto">
                    {/* Breadcrumbs */}
                    <nav className="mb-8 text-sm text-[var(--color-text-muted)]">
                        <Link href="/notes" className="hover:text-[var(--color-accent-500)]">
                            Notes
                        </Link>
                        <span className="mx-2">/</span>
                        <span className="text-[var(--color-accent-500)]">{note.category}</span>
                        {note.book && (
                            <>
                                <span className="mx-2">/</span>
                                <span>{note.book}</span>
                            </>
                        )}
                    </nav>

                    {/* Note Header */}
                    <div className="mb-8 animate-fade-in-up">
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="tag">{note.category}</span>
                            {note.book && (
                                <span className="tag">{note.book}</span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-4">
                            {note.title}
                        </h1>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            {note.word_count.toLocaleString()} words
                        </p>
                    </div>

                    {/* Note Content */}
                    <article className="card animate-fade-in-up">
                        <div className="prose prose-invert max-w-none">
                            <MarkdownContent content={note.content} />
                        </div>
                    </article>

                    {/* Related Links */}
                    {note.links && note.links.length > 0 && (
                        <div className="mt-8 animate-fade-in-up">
                            <h3 className="text-lg font-semibold mb-4 text-[var(--color-text-primary)]">
                                Related Notes
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {note.links.map((link) => (
                                    <span
                                        key={link}
                                        className="px-3 py-1 bg-[var(--color-space-700)] rounded-lg text-sm text-[var(--color-text-secondary)]"
                                    >
                                        [[{link}]]
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Back Button */}
                    <div className="mt-12">
                        <Link
                            href="/notes"
                            className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-500)] transition-colors flex items-center gap-2"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                            Back to all notes
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

// Simple markdown renderer
function MarkdownContent({ content }: { content: string }) {
    // Process content line by line
    const processContent = (text: string) => {
        const lines = text.split("\n");
        const elements: React.ReactNode[] = [];
        let inCodeBlock = false;
        let codeContent = "";
        let codeLanguage = "";

        lines.forEach((line, index) => {
            // Code blocks
            if (line.startsWith("```")) {
                if (!inCodeBlock) {
                    inCodeBlock = true;
                    codeLanguage = line.slice(3).trim();
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
                    <h3
                        key={index}
                        className="text-xl font-semibold mt-6 mb-3 text-[var(--color-text-primary)]"
                    >
                        {processInlineStyles(line.slice(4))}
                    </h3>
                );
                return;
            }
            if (line.startsWith("## ")) {
                elements.push(
                    <h2
                        key={index}
                        className="text-2xl font-semibold mt-8 mb-4 text-gradient"
                    >
                        {processInlineStyles(line.slice(3))}
                    </h2>
                );
                return;
            }
            if (line.startsWith("# ")) {
                elements.push(
                    <h1
                        key={index}
                        className="text-3xl font-bold mt-8 mb-4 text-[var(--color-text-primary)]"
                    >
                        {processInlineStyles(line.slice(2))}
                    </h1>
                );
                return;
            }

            // Blockquotes
            if (line.startsWith("> ")) {
                elements.push(
                    <blockquote
                        key={index}
                        className="border-l-4 border-[var(--color-accent-500)] pl-4 my-4 italic text-[var(--color-text-secondary)]"
                    >
                        {processInlineStyles(line.slice(2))}
                    </blockquote>
                );
                return;
            }

            // List items
            if (line.match(/^[-*]\s/)) {
                elements.push(
                    <li
                        key={index}
                        className="ml-4 text-[var(--color-text-secondary)]"
                    >
                        {processInlineStyles(line.slice(2))}
                    </li>
                );
                return;
            }

            // Numbered lists
            if (line.match(/^\d+\.\s/)) {
                elements.push(
                    <li
                        key={index}
                        className="ml-4 text-[var(--color-text-secondary)] list-decimal"
                    >
                        {processInlineStyles(line.replace(/^\d+\.\s/, ""))}
                    </li>
                );
                return;
            }

            // Empty lines
            if (line.trim() === "") {
                elements.push(<br key={index} />);
                return;
            }

            // Regular paragraphs
            elements.push(
                <p key={index} className="my-3 text-[var(--color-text-secondary)] leading-relaxed">
                    {processInlineStyles(line)}
                </p>
            );
        });

        return elements;
    };

    // Process inline styles (bold, italic, links, wiki links)
    const processInlineStyles = (text: string): React.ReactNode => {
        // Wiki links [[Note Name]]
        const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
        let result = text;
        result = result.replace(wikiLinkRegex, (_, linkText) => {
            return `<span class="text-[var(--color-accent-500)]">[[${linkText}]]</span>`;
        });

        // Bold
        result = result.replace(
            /\*\*([^*]+)\*\*/g,
            '<strong class="text-[var(--color-text-primary)]">$1</strong>'
        );

        // Italic
        result = result.replace(/\*([^*]+)\*/g, "<em>$1</em>");

        // Inline code
        result = result.replace(
            /`([^`]+)`/g,
            '<code class="bg-[var(--color-space-700)] px-1 py-0.5 rounded text-sm font-mono text-[var(--color-accent-400)]">$1</code>'
        );

        return <span dangerouslySetInnerHTML={{ __html: result }} />;
    };

    return <div>{processContent(content)}</div>;
}
