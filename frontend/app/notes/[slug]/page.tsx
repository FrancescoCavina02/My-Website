"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchNote, searchNotes, Note } from "@/lib/api";

export default function NotePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;

        setLoading(true);
        fetchNote(slug)
            .then((data) => {
                setNote(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Could not load note.");
                setLoading(false);
            });
    }, [slug]);

    // Handle wiki link click
    const handleWikiLinkClick = async (linkText: string) => {
        try {
            const results = await searchNotes(linkText);
            if (results.length > 0) {
                const exactMatch = results.find(
                    (r) => r.title.toLowerCase() === linkText.toLowerCase()
                );
                const noteToLoad = exactMatch || results[0];
                router.push(`/notes/${noteToLoad.id}`);
            }
        } catch (err) {
            console.error("Failed to navigate:", err);
        }
    };

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
                    <Link href="/notes" className="btn btn-secondary">
                        Back to Notes
                    </Link>
                </section>
            </div>
        );
    }

    const nav = note.navigation;

    return (
        <div className="min-h-screen">
            <section className="section">
                <div className="max-w-4xl mx-auto">
                    {/* Breadcrumb Navigation */}
                    <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm bg-[var(--color-space-800)] rounded-lg px-4 py-3">
                        <Link
                            href="/notes"
                            className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-500)]"
                        >
                            📚 Notes
                        </Link>

                        {note.category && (
                            <>
                                <span className="text-[var(--color-text-muted)]">›</span>
                                <span className="text-[var(--color-text-muted)]">
                                    {note.category}
                                </span>
                            </>
                        )}

                        {note.book && (
                            <>
                                <span className="text-[var(--color-text-muted)]">›</span>
                                <span className="text-[var(--color-text-muted)]">
                                    {note.book}
                                </span>
                            </>
                        )}

                        {nav?.breadcrumbs?.map((crumb, idx, arr) => (
                            <span key={crumb.id} className="flex items-center gap-2">
                                <span className="text-[var(--color-text-muted)]">›</span>
                                {idx === arr.length - 1 ? (
                                    <span className="text-[var(--color-accent-500)]">
                                        {crumb.title}
                                    </span>
                                ) : (
                                    <Link
                                        href={`/notes/${crumb.id}`}
                                        className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-500)]"
                                    >
                                        {crumb.title}
                                    </Link>
                                )}
                            </span>
                        ))}

                        {!nav?.breadcrumbs?.length && (
                            <>
                                <span className="text-[var(--color-text-muted)]">›</span>
                                <span className="text-[var(--color-accent-500)]">
                                    {note.title}
                                </span>
                            </>
                        )}
                    </nav>

                    {/* Parent Navigation */}
                    {nav?.parent && (
                        <Link
                            href={`/notes/${nav.parent.id}`}
                            className="inline-flex items-center gap-2 mb-4 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-500)]"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to {nav.parent.title}
                        </Link>
                    )}

                    {/* Note Card */}
                    <div className="card">
                        {/* Header */}
                        <div className="mb-6 pb-4 border-b border-white/10">
                            <div className="flex flex-wrap gap-2 mb-3">
                                {note.category && <span className="tag">{note.category}</span>}
                                {note.book && <span className="tag">{note.book}</span>}
                            </div>
                            <h1 className="text-3xl font-bold text-gradient mb-2">
                                {note.title}
                            </h1>
                            <p className="text-sm text-[var(--color-text-muted)]">
                                {note.word_count.toLocaleString()} words
                            </p>
                        </div>

                        {/* Content */}
                        <article className="prose prose-invert max-w-none">
                            <NoteContent content={note.content} onLinkClick={handleWikiLinkClick} />
                        </article>

                        {/* Children Navigation */}
                        {nav?.children && nav.children.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-white/10">
                                <h3 className="text-lg font-semibold mb-4">Continue Reading</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {nav.children.map((child) => (
                                        <Link
                                            key={child.id}
                                            href={`/notes/${child.id}`}
                                            className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-space-700)] hover:bg-[var(--color-space-600)] transition-colors group"
                                        >
                                            <span className="group-hover:text-[var(--color-accent-500)]">
                                                {child.title}
                                            </span>
                                            <svg className="w-4 h-4 text-[var(--color-text-muted)] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Siblings */}
                        {nav?.siblings && nav.siblings.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <h3 className="text-sm font-medium mb-3 text-[var(--color-text-muted)]">
                                    Related Sections
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {nav.siblings.map((sibling) => (
                                        <Link
                                            key={sibling.id}
                                            href={`/notes/${sibling.id}`}
                                            className="px-3 py-1 bg-[var(--color-space-700)] rounded text-sm hover:text-[var(--color-accent-500)] transition-colors"
                                        >
                                            {sibling.title}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Back Link */}
                    <div className="mt-8">
                        <Link
                            href="/notes"
                            className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-500)]"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            All Notes
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

// Note content renderer
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
        if (line.startsWith("```")) {
            if (!inCodeBlock) {
                inCodeBlock = true;
                codeContent = "";
            } else {
                inCodeBlock = false;
                elements.push(
                    <pre key={index} className="bg-[var(--color-space-700)] p-4 rounded-lg overflow-x-auto my-4">
                        <code className="text-sm font-mono">{codeContent}</code>
                    </pre>
                );
            }
            return;
        }

        if (inCodeBlock) {
            codeContent += line + "\n";
            return;
        }

        if (line.startsWith("### ")) {
            elements.push(
                <h3 key={index} className="text-xl font-semibold mt-6 mb-3">
                    {renderInline(line.slice(4), onLinkClick)}
                </h3>
            );
            return;
        }
        if (line.startsWith("## ")) {
            elements.push(
                <h2 key={index} className="text-2xl font-semibold mt-8 mb-4 text-gradient">
                    {renderInline(line.slice(3), onLinkClick)}
                </h2>
            );
            return;
        }
        if (line.startsWith("# ")) {
            elements.push(
                <h1 key={index} className="text-3xl font-bold mt-8 mb-4">
                    {renderInline(line.slice(2), onLinkClick)}
                </h1>
            );
            return;
        }

        if (line.startsWith("> ")) {
            elements.push(
                <blockquote key={index} className="border-l-4 border-[var(--color-accent-500)] pl-4 my-4 italic text-[var(--color-text-secondary)]">
                    {renderInline(line.slice(2), onLinkClick)}
                </blockquote>
            );
            return;
        }

        if (line.match(/^[-*]\s/)) {
            elements.push(
                <li key={index} className="ml-4 text-[var(--color-text-secondary)]">
                    {renderInline(line.slice(2), onLinkClick)}
                </li>
            );
            return;
        }

        if (line.match(/^\d+\.\s/)) {
            elements.push(
                <li key={index} className="ml-4 list-decimal text-[var(--color-text-secondary)]">
                    {renderInline(line.replace(/^\d+\.\s/, ""), onLinkClick)}
                </li>
            );
            return;
        }

        if (line.trim() === "") {
            elements.push(<div key={index} className="h-3" />);
            return;
        }

        elements.push(
            <p key={index} className="my-2 text-[var(--color-text-secondary)] leading-relaxed">
                {renderInline(line, onLinkClick)}
            </p>
        );
    });

    return <div>{elements}</div>;
}

function renderInline(text: string, onLinkClick: (linkText: string) => void): React.ReactNode {
    const wikiLinkPattern = /\[\[([^\]]+)\]\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = wikiLinkPattern.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(
                <span key={lastIndex} dangerouslySetInnerHTML={{ __html: formatText(text.slice(lastIndex, match.index)) }} />
            );
        }

        const linkText = match[1];
        parts.push(
            <button
                key={match.index}
                onClick={() => onLinkClick(linkText)}
                className="text-[var(--color-accent-500)] hover:underline cursor-pointer"
            >
                {linkText}
            </button>
        );

        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        parts.push(
            <span key={lastIndex} dangerouslySetInnerHTML={{ __html: formatText(text.slice(lastIndex)) }} />
        );
    }

    return parts.length > 0 ? parts : <span dangerouslySetInnerHTML={{ __html: formatText(text) }} />;
}

function formatText(text: string): string {
    return text
        .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-[var(--color-text-primary)]">$1</strong>')
        .replace(/\*([^*]+)\*/g, "<em>$1</em>")
        .replace(/`([^`]+)`/g, '<code class="bg-[var(--color-space-700)] px-1 py-0.5 rounded text-sm font-mono text-[var(--color-accent-400)]">$1</code>');
}
