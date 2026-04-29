'use client';

import React from 'react';
import { Note } from '@/lib/api';
import MarkdownRenderer from '@/components/notes/MarkdownRenderer';

interface NoteViewerProps {
  note: Note;
  /** Called when user clicks a child or sibling card — receives the note id */
  onNavigate: (noteId: string) => void;
  /** Called when user clicks a [[wiki link]] inside the note content */
  onWikiLinkClick: (linkText: string) => void;
}

/**
 * NoteViewer renders a full note with:
 *  - Breadcrumb navigation (from note.navigation.breadcrumbs)
 *  - "← Back to <parent>" link
 *  - Note header (title, category/book/depth/leaf badges)
 *  - Markdown content via MarkdownRenderer
 *  - "Continue Reading" children cards
 *  - "Related Sections" siblings pills
 *
 * Navigation data is read directly from `note.navigation` (already embedded
 * in the GET /api/notes/{id} response) — no extra API call needed.
 */
export default function NoteViewer({ note, onNavigate, onWikiLinkClick }: NoteViewerProps) {
  const nav = note.navigation;

  // Breadcrumbs: all items except the last (which is the current note)
  const breadcrumbTrail = nav?.breadcrumbs
    ? nav.breadcrumbs.slice(0, nav.breadcrumbs.length - 1)
    : [];

  return (
    <div className="animate-fade-in-up">
      {/* ── Breadcrumb navigation ───────────────────────────────────────── */}
      {(breadcrumbTrail.length > 0 || note.category) && (
        <nav
          className="mb-6 flex flex-wrap items-center gap-2 text-sm rounded-lg px-4 py-3"
          style={{
            background: 'var(--color-space-800, #111827)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
          aria-label="Note breadcrumb"
        >
          {/* Category */}
          {note.category && (
            <>
              <span style={{ color: 'var(--color-text-muted)' }}>{note.category}</span>
            </>
          )}

          {/* Book */}
          {note.book && (
            <>
              <span style={{ color: 'var(--color-text-muted)' }}>›</span>
              <span style={{ color: 'var(--color-text-muted)' }}>{note.book}</span>
            </>
          )}

          {/* Breadcrumb trail from navigation context */}
          {breadcrumbTrail.map((crumb) => (
            <React.Fragment key={crumb.id}>
              <span style={{ color: 'var(--color-text-muted)' }}>›</span>
              <button
                onClick={() => onNavigate(crumb.id)}
                className="hover:underline transition-colors"
                style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent-500)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                {crumb.title}
              </button>
            </React.Fragment>
          ))}

          {/* Current note */}
          <span style={{ color: 'var(--color-text-muted)' }}>›</span>
          <span style={{ color: 'var(--color-accent-500, #0ea5e9)' }}>{note.title}</span>
        </nav>
      )}

      {/* ── Back to parent link ─────────────────────────────────────────── */}
      {nav?.parent && (
        <button
          onClick={() => onNavigate(nav.parent!.id)}
          className="mb-4 flex items-center gap-2 text-sm transition-colors"
          style={{
            color: 'var(--color-text-secondary)',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent-500)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to {nav.parent.title}
        </button>
      )}

      {/* ── Note card ───────────────────────────────────────────────────── */}
      <div className="card">
        {/* Header */}
        <div className="mb-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {note.category && <span className="tag">{note.category}</span>}
            {note.book && <span className="tag">{note.book}</span>}
            {nav && typeof nav.depth === 'number' && nav.depth > 0 && (
              <span className="tag">Depth {nav.depth}</span>
            )}
            {nav?.is_leaf && (
              <span
                className="tag"
                style={{
                  color: 'var(--color-accent-500)',
                  borderColor: 'var(--color-accent-500)',
                }}
              >
                Chapter
              </span>
            )}
          </div>

          {/* Title */}
          <h2
            className="font-semibold mb-2"
            style={{
              fontSize: 'clamp(1.4rem, 3vw, 2rem)',
              color: 'var(--color-text-primary)',
              lineHeight: 1.25,
            }}
          >
            {note.title}
          </h2>

          {/* Word count */}
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            {note.word_count.toLocaleString()} words
          </p>
        </div>

        {/* ── Markdown content ─────────────────────────────────────────── */}
        <article className="prose prose-invert max-w-none">
          <MarkdownRenderer content={note.content} onWikiLinkClick={onWikiLinkClick} />
        </article>

        {/* ── Continue Reading (children) ──────────────────────────────── */}
        {nav?.children && nav.children.length > 0 && (
          <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <h3
              className="font-semibold mb-4"
              style={{ color: 'var(--color-text-primary)', fontSize: '1.1rem' }}
            >
              Continue Reading
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {nav.children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => onNavigate(child.id)}
                  className="flex items-center justify-between p-3 rounded-lg text-left group transition-colors"
                  style={{
                    background: 'var(--color-space-700, #1e1e2e)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--color-space-600, #27272a)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--color-space-700, #1e1e2e)';
                  }}
                >
                  <span
                    className="font-medium transition-colors"
                    style={{ color: 'var(--color-text-primary)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent-500)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                  >
                    {child.title}
                  </span>
                  <svg
                    className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Related Sections (siblings) ──────────────────────────────── */}
        {nav?.siblings && nav.siblings.length > 0 && (
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <h3
              className="mb-3 font-medium"
              style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}
            >
              Related Sections
            </h3>
            <div className="flex flex-wrap gap-2">
              {nav.siblings.map((sibling) => (
                <button
                  key={sibling.id}
                  onClick={() => onNavigate(sibling.id)}
                  className="px-3 py-1 rounded text-sm transition-colors"
                  style={{
                    background: 'var(--color-space-700, #1e1e2e)',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = 'var(--color-accent-500)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)';
                  }}
                >
                  {sibling.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
