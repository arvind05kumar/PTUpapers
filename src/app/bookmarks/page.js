'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import PaperCard from '@/components/PaperCard';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function BookmarksPage() {
  const [papers, setPapers] = useState([]);
  const [bookmarkedPapers, setBookmarkedPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Sync bookmarks from localStorage
  const loadBookmarks = (allPapersList = papers) => {
    if (typeof window === 'undefined') return;
    const bookmarkIds = JSON.parse(localStorage.getItem('ptu_bookmarks') || '[]');
    const bookmarked = allPapersList.filter((p) => bookmarkIds.includes(p.id));
    setBookmarkedPapers(bookmarked);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    async function loadData() {
      try {
        const res = await fetch('/api/papers');
        const data = await res.json();
        const papersList = data.papers || [];
        setPapers(papersList);
        loadBookmarks(papersList);
      } catch (err) {
        console.error('Failed to load papers for bookmarks', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBookmarkChange = () => {
    loadBookmarks();
  };

  const breadcrumbItems = [{ label: 'My Bookmarks' }];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Headline */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl tracking-tight">
            My Bookmarked Papers
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Access your saved question papers quickly. These are stored locally in your browser.
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-slate-500">Loading saved bookmarks...</div>
          </div>
        ) : mounted && bookmarkedPapers.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bookmarkedPapers.map((paper) => (
              <PaperCard
                key={paper.id}
                paper={paper}
                onBookmarkChange={handleBookmarkChange}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center max-w-xl mx-auto mt-8">
            <span className="text-4xl mb-4 block">⭐</span>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No bookmarked papers</h3>
            <p className="text-sm text-slate-500 mb-6">
              You haven&apos;t bookmarked any question papers yet. Save papers you need so you can find them instantly.
            </p>
            <div className="flex justify-center">
              <Link
                href="/browse"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                Browse & Save Papers
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
