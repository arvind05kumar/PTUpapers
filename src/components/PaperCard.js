'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PaperCard({ paper, onBookmarkChange }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const bookmarks = JSON.parse(localStorage.getItem('ptu_bookmarks') || '[]');
    setIsBookmarked(bookmarks.includes(paper.id));
  }, [paper.id]);

  const toggleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const bookmarks = JSON.parse(localStorage.getItem('ptu_bookmarks') || '[]');
    let newBookmarks;
    if (isBookmarked) {
      newBookmarks = bookmarks.filter((id) => id !== paper.id);
    } else {
      newBookmarks = [...bookmarks, paper.id];
    }
    localStorage.setItem('ptu_bookmarks', JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);
    if (onBookmarkChange) onBookmarkChange();
  };

  const incrementStats = async (action) => {
    try {
      await fetch(`/api/papers/${paper.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
    } catch (e) {
      console.error('Failed to increment stats', e);
    }
  };

  // Generate a clean SEO-friendly URL
  const getPaperUrl = () => {
    const cleanBranch = encodeURIComponent(paper.branch.toLowerCase().replace(/\s+/g, '-'));
    const cleanSem = encodeURIComponent(paper.semester.toLowerCase().replace(/\s+/g, '-'));
    const cleanSubject = encodeURIComponent(paper.subjectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    return `/papers/${cleanBranch}/${cleanSem}/${cleanSubject}/${paper.year}?id=${paper.id}`;
  };

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md">
      <div>
        {/* Header tags */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
            {paper.branch}
          </span>
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {paper.semester}
          </span>
          <span className="ml-auto inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
            {paper.year}
          </span>
        </div>

        {/* Subject details */}
        <Link href={getPaperUrl()} onClick={() => incrementStats('view')}>
          <h3 className="text-base font-semibold leading-6 text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {paper.subjectName}
          </h3>
        </Link>
        <p className="mt-1 text-sm font-mono text-slate-500">{paper.subjectCode}</p>

        {/* Info stats */}
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-slate-400">
              <path d="M10 12.5 a 2.5 2.5 0 1 0 0-5 a 2.5 2.5 0 0 0 0 5z" />
              <path fillRule="evenodd" d="M.664 9.576 a 1.5 1.5 0 0 0 0 2.848 C 1.503 12.752 4.966 17 10 17 c 5.034 0 8.497-4.248 9.336-4.576 a 1.5 1.5 0 0 0 0-2.848 C 18.497 9.248 15.034 5 10 5 c-4.966 0-8.497 4.252-9.336 4.576 z M 15 10 a 5 5 0 1 1-10 0 a 5 5 0 0 1 10 0z" clipRule="evenodd" />
            </svg>
            {paper.viewCount} views
          </span>
          <span className="inline-flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-slate-400">
              <path d="M10.75 2.75 a .75 .75 0 0 0-1.5 0 v 8.614 L 6.295 8.232 a .75 .75 0 1 0-1.09 1.03 l 4.25 4.5 a .75 .75 0 0 0 1.09 0 l 4.25-4.5 a .75 .75 0 0 0-1.09-1.03 l-2.955 3.132 V 2.75z" />
              <path d="M3.5 12.75 a .75 .75 0 0 0-1.5 0 v 3.75 A 1.75 1.75 0 0 0 3.75 18.25 h 12.5 A 1.75 1.75 0 0 0 18 16.5 v-3.75 a .75 .75 0 0 0-1.5 0 v 3.75 a .25 .25 0 0 1-.25 .25 H 3.75 a .25 .25 0 0 1-.25-.25 v-3.75z" />
            </svg>
            {paper.downloadCount} downloads
          </span>
        </div>
      </div>

      {/* Footer / CTA and Bookmark toggle */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="inline-flex items-center rounded-md bg-slate-150 px-2 py-0.5 text-xs font-semibold text-slate-600 bg-slate-100">
          {paper.examType}
        </span>

        <div className="flex items-center gap-2">
          {/* Bookmark Button */}
          {mounted && (
            <button
              onClick={toggleBookmark}
              className={`flex h-8 w-8 items-center justify-center rounded-md border text-slate-400 hover:text-amber-500 hover:border-amber-300 hover:bg-amber-50 transition-colors ${
                isBookmarked
                  ? 'border-amber-200 bg-amber-50 text-amber-500'
                  : 'border-slate-200 bg-white'
              }`}
              title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.6 3.1-1.196 4.636c-.21.81.664 1.444 1.372 1.006L10 15.765l4.177 2.301c.708.438 1.582-.196 1.372-1.006l-1.196-4.636 3.6-3.1c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.83-4.401z" clipRule="evenodd" />
              </svg>
            </button>
          )}

          {/* View/Download Button */}
          <Link
            href={getPaperUrl()}
            onClick={() => incrementStats('view')}
            className="inline-flex items-center justify-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none transition-colors"
          >
            <span>View & Download</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.97H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
