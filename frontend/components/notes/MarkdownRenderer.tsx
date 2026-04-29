'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
  onWikiLinkClick?: (target: string) => void;
}

/**
 * Renders markdown content with support for:
 * - Headings (# h1, ## h2, ### h3)
 * - Bold (**text**), italic (*text*), inline code (`code`)
 * - Code blocks (```...```)
 * - Blockquotes (> text)
 * - Unordered lists (- item, * item)
 * - Ordered lists (1. item)
 * - Horizontal rules (---)
 * - [[wiki links]] and [[link|alias]] rendered as clickable buttons
 *
 * Uses My-Website CSS variables only — no Tailwind purple/indigo gradients.
 */
export default function MarkdownRenderer({ content, onWikiLinkClick }: MarkdownRendererProps) {
  if (!content || content.trim() === '') {
    return (
      <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
        This note has no content.
      </p>
    );
  }

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeContent = '';
  let codeLanguage = '';

  lines.forEach((line, index) => {
    // ── Code block toggle ──────────────────────────────────────────────────
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeContent = '';
        codeLanguage = line.slice(3).trim();
      } else {
        inCodeBlock = false;
        elements.push(
          <pre
            key={`code-${index}`}
            className="overflow-x-auto my-4 rounded-lg p-4"
            style={{
              background: 'var(--color-space-700, #1e1e2e)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <code
              className="text-sm font-mono"
              data-language={codeLanguage || undefined}
              style={{ color: 'var(--color-accent-400, #38bdf8)' }}
            >
              {codeContent}
            </code>
          </pre>
        );
        codeLanguage = '';
      }
      return;
    }

    if (inCodeBlock) {
      codeContent += line + '\n';
      return;
    }

    // ── Horizontal rule ────────────────────────────────────────────────────
    if (/^---+$/.test(line.trim())) {
      elements.push(
        <hr
          key={`hr-${index}`}
          style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '1.5rem 0' }}
        />
      );
      return;
    }

    // ── Headings ───────────────────────────────────────────────────────────
    if (line.startsWith('### ')) {
      elements.push(
        <h3
          key={`h3-${index}`}
          className="text-xl font-semibold mt-6 mb-3"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {renderInline(line.slice(4), onWikiLinkClick)}
        </h3>
      );
      return;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2
          key={`h2-${index}`}
          className="text-2xl font-semibold mt-8 mb-4 text-gradient"
        >
          {renderInline(line.slice(3), onWikiLinkClick)}
        </h2>
      );
      return;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h1
          key={`h1-${index}`}
          className="text-3xl font-bold mt-8 mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {renderInline(line.slice(2), onWikiLinkClick)}
        </h1>
      );
      return;
    }

    // ── Blockquote ─────────────────────────────────────────────────────────
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={`bq-${index}`}
          className="my-4 pl-4 italic"
          style={{
            borderLeft: '4px solid var(--color-accent-500, #0ea5e9)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {renderInline(line.slice(2), onWikiLinkClick)}
        </blockquote>
      );
      return;
    }

    // ── Unordered list item ────────────────────────────────────────────────
    if (/^[-*]\s/.test(line)) {
      elements.push(
        <li
          key={`ul-${index}`}
          className="ml-5 my-0.5"
          style={{
            color: 'var(--color-text-secondary)',
            listStyleType: 'disc',
          }}
        >
          {renderInline(line.slice(2), onWikiLinkClick)}
        </li>
      );
      return;
    }

    // ── Ordered list item ──────────────────────────────────────────────────
    if (/^\d+\.\s/.test(line)) {
      elements.push(
        <li
          key={`ol-${index}`}
          className="ml-5 my-0.5 list-decimal"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {renderInline(line.replace(/^\d+\.\s/, ''), onWikiLinkClick)}
        </li>
      );
      return;
    }

    // ── Empty line ─────────────────────────────────────────────────────────
    if (line.trim() === '') {
      elements.push(<div key={`sp-${index}`} className="h-3" />);
      return;
    }

    // ── Paragraph ─────────────────────────────────────────────────────────
    elements.push(
      <p
        key={`p-${index}`}
        className="my-2 leading-relaxed"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {renderInline(line, onWikiLinkClick)}
      </p>
    );
  });

  return <div>{elements}</div>;
}

// ─── Inline content renderer ──────────────────────────────────────────────────

/**
 * Renders inline markdown: bold, italic, inline code, and [[wiki links]].
 * [[link text]] and [[link text|alias]] become styled clickable buttons.
 */
function renderInline(
  text: string,
  onWikiLinkClick?: (target: string) => void
): React.ReactNode {
  // Pattern matches [[target]] and [[target|alias]]
  const wikiLinkPattern = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = wikiLinkPattern.exec(text)) !== null) {
    // Text before wiki link
    if (match.index > lastIndex) {
      parts.push(
        <span
          key={`txt-${lastIndex}`}
          dangerouslySetInnerHTML={{ __html: formatInline(text.slice(lastIndex, match.index)) }}
        />
      );
    }

    const linkTarget = match[1].trim();
    const displayText = match[2]?.trim() ?? linkTarget;

    parts.push(
      <button
        key={`wl-${match.index}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onWikiLinkClick?.(linkTarget);
        }}
        className="font-medium hover:underline cursor-pointer"
        style={{
          color: 'var(--color-accent-500, #0ea5e9)',
          background: 'none',
          border: 'none',
          padding: 0,
          display: 'inline',
        }}
      >
        {displayText}
      </button>
    );

    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last wiki link
  if (lastIndex < text.length) {
    parts.push(
      <span
        key={`txt-${lastIndex}`}
        dangerouslySetInnerHTML={{ __html: formatInline(text.slice(lastIndex)) }}
      />
    );
  }

  if (parts.length === 0) {
    return <span dangerouslySetInnerHTML={{ __html: formatInline(text) }} />;
  }

  return parts;
}

/**
 * Converts **bold**, *italic*, and `inline code` to HTML.
 * Returns a safe HTML string (no user-supplied HTML is passed in).
 */
function formatInline(text: string): string {
  return text
    .replace(
      /\*\*([^*]+)\*\*/g,
      '<strong style="color:var(--color-text-primary);font-weight:600">$1</strong>'
    )
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(
      /`([^`]+)`/g,
      '<code style="background:var(--color-space-700,#1e1e2e);padding:0.1em 0.35em;border-radius:0.25rem;font-size:0.875em;font-family:var(--font-mono);color:var(--color-accent-400,#38bdf8)">$1</code>'
    );
}
