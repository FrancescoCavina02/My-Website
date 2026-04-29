'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchNote, Note } from '@/lib/api';
import NoteViewer from '@/components/notes/NoteViewer';
import NoteSkeleton from '@/components/loading/NoteSkeleton';
import Link from 'next/link';

export default function NoteSlugPage() {
  const params = useParams();
  const router = useRouter();

  // Catch-all gives us slug as string[] — join with '/' to rebuild file paths
  const rawSlug = params.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug.join('/') : (rawSlug as string);

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    fetchNote(decodeURIComponent(slug))
      .then(setNote)
      .catch(() => setError('Note not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleNavigate = (noteId: string) => {
    router.push(`/notes/${encodeURIComponent(noteId)}`);
  };

  const handleWikiLinkClick = (linkText: string) => {
    router.push(`/notes/${encodeURIComponent(linkText)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <section className="section">
          <div className="max-w-5xl mx-auto">
            <NoteSkeleton />
          </div>
        </section>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen">
        <section className="section text-center">
          <h1
            className="text-2xl font-semibold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Note Not Found
          </h1>
          <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>
            {error ?? 'The requested note could not be loaded.'}
          </p>
          <Link href="/notes" className="btn btn-secondary">
            ← Back to Notes
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="section">
        <div className="max-w-5xl mx-auto">
          {/* Link back to the full notes browser */}
          <div className="mb-4">
            <Link
              href="/notes"
              className="inline-flex items-center gap-2 text-sm transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              All Notes
            </Link>
          </div>

          <NoteViewer
            note={note}
            onNavigate={handleNavigate}
            onWikiLinkClick={handleWikiLinkClick}
          />
        </div>
      </section>
    </div>
  );
}
