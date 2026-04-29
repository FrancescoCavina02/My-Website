'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchNote, searchNotes, Note } from '@/lib/api';
import NoteViewer from '@/components/notes/NoteViewer';
import NoteSkeleton from '@/components/loading/NoteSkeleton';

export default function NoteSlugPage() {
  const params = useParams();
  const router = useRouter();

  // Catch-all gives slug as string[] — decode each segment then join with '/'
  const slugArr = Array.isArray(params.slug)
    ? params.slug
    : [params.slug as string];
  const noteId = slugArr.map(decodeURIComponent).join('/');

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!noteId) return;
    setLoading(true);
    setError(null);
    fetchNote(noteId)
      .then(setNote)
      .catch(() => setError('Note not found.'))
      .finally(() => setLoading(false));
  }, [noteId]);

  const handleNavigate = (id: string) => {
    router.push(`/notes/${encodeURIComponent(id)}`);
  };

  // Wiki links resolved via semantic search (same strategy as notes/page.tsx)
  const handleWikiLinkClick = async (linkText: string) => {
    try {
      const results = await searchNotes(linkText, 5);
      if (results.length > 0) {
        const exactInBook = results.find(
          (r) =>
            r.title.toLowerCase() === linkText.toLowerCase() &&
            r.book === note?.book
        );
        const exactAny = results.find(
          (r) => r.title.toLowerCase() === linkText.toLowerCase()
        );
        const best = exactInBook ?? exactAny ?? results[0];
        router.push(`/notes/${encodeURIComponent(best.id)}`);
      }
    } catch {
      console.error('Wiki link navigation failed for:', linkText);
    }
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
        <section className="section">
          <div
            className="max-w-5xl mx-auto text-center py-12"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <p>{error ?? 'Note not found.'}</p>
            <button
              onClick={() => router.push('/notes')}
              className="mt-4 text-sm underline"
              style={{
                color: 'var(--color-accent-500)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ← Back to notes
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="section">
        <div className="max-w-5xl mx-auto">
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
