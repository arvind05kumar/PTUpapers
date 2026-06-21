'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PDFViewer from '@/components/PDFViewer';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function PaperDetailsClient({ paper, relatedPapers }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [issueType, setIssueType] = useState('Wrong Paper');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const bookmarks = JSON.parse(localStorage.getItem('ptu_bookmarks') || '[]');
    setIsBookmarked(bookmarks.includes(paper.id));
  }, [paper.id]);

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('ptu_bookmarks') || '[]');
    let newBookmarks;
    if (isBookmarked) {
      newBookmarks = bookmarks.filter((id) => id !== paper.id);
    } else {
      newBookmarks = [...bookmarks, paper.id];
    }
    localStorage.setItem('ptu_bookmarks', JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);
  };

  const handleDownload = async () => {
    try {
      await fetch(`/api/papers/${paper.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'download' }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperId: paper.id,
          issueType,
          message: feedbackMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackSuccess(true);
        setFeedbackMessage('');
        setTimeout(() => {
          setShowFeedbackModal(false);
          setFeedbackSuccess(false);
        }, 2500);
      }
    } catch (err) {
      console.error('Failed to submit feedback', err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Build dynamic breadcrumbs
  const breadcrumbItems = [
    { label: paper.branch, href: `/browse?branch=${encodeURIComponent(paper.branch)}` },
    {
      label: paper.semester,
      href: `/browse?branch=${encodeURIComponent(paper.branch)}&semester=${encodeURIComponent(
        paper.semester
      )}`,
    },
    { label: paper.subjectName },
  ];

  const shareText = `Download PTU ${paper.year} ${paper.branch} ${paper.semester} Question Paper for ${paper.subjectName} (${paper.subjectCode}):`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    shareText + ' ' + (typeof window !== 'undefined' ? window.location.href : '')
  )}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
      {/* Breadcrumbs */}
      <div className="mb-4">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* PDF Viewer Block */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <PDFViewer pdfUrl={paper.pdfUrl} title={`${paper.subjectName} (${paper.year})`} />
        </div>

        {/* Paper Details Sidebar */}
        <div className="flex flex-col space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              {paper.subjectName}
            </h1>
            <p className="mt-1 text-sm font-mono text-slate-500">{paper.subjectCode}</p>

            <div className="mt-6 border-t border-b border-slate-100 py-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Course</span>
                <span className="font-semibold text-slate-800">{paper.branch}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Semester</span>
                <span className="font-semibold text-slate-800">{paper.semester}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Exam Year</span>
                <span className="font-semibold text-slate-855 text-blue-600">{paper.year}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Exam Type</span>
                <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
                  {paper.examType}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              {/* Primary Download Button */}
              <a
                href={paper.pdfUrl}
                download={`${paper.subjectName}_${paper.year}.pdf`}
                onClick={handleDownload}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
                <span>Download PDF Question Paper</span>
              </a>

              {/* Secondary bookmark & share */}
              <div className="grid grid-cols-2 gap-2">
                {mounted && (
                  <button
                    onClick={toggleBookmark}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                      isBookmarked
                        ? 'border-amber-200 bg-amber-50 text-amber-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.6 3.1-1.196 4.636c-.21.81.664 1.444 1.372 1.006L10 15.765l4.177 2.301c.708.438 1.582-.196 1.372-1.006l-1.196-4.636 3.6-3.1c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.83-4.401z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                  </button>
                )}

                <button
                  onClick={handleCopyLink}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-3.5 h-3.5 text-slate-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                    />
                  </svg>
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              {/* WhatsApp Share button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                <svg
                  className="w-4 h-4 fill-emerald-600"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.451 5.437 0 9.862-4.421 9.865-9.864.001-2.636-1.02-5.11-2.871-6.963C16.512 1.924 14.043.902 11.41.902 5.973.902 1.547 5.324 1.543 10.77c-.001 1.611.424 3.185 1.231 4.593l-.994 3.634 3.867-.993z" />
                </svg>
                <span>Share on WhatsApp</span>
              </a>
            </div>

            {/* View Stats & Issue button */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                {paper.viewCount} views • {paper.downloadCount} downloads
              </span>
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="font-semibold text-slate-500 hover:text-red-600 transition-colors"
              >
                Report issue / wrong paper
              </button>
            </div>
          </div>

          {/* Related Papers list */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Related Papers</h3>
            {relatedPapers.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {relatedPapers.map((rp) => {
                  const cleanBranch = encodeURIComponent(
                    rp.branch.toLowerCase().replace(/\s+/g, '-')
                  );
                  const cleanSem = encodeURIComponent(
                    rp.semester.toLowerCase().replace(/\s+/g, '-')
                  );
                  const cleanSubject = encodeURIComponent(
                    rp.subjectName
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)/g, '')
                  );
                  const rpUrl = `/papers/${cleanBranch}/${cleanSem}/${cleanSubject}/${rp.year}?id=${rp.id}`;

                  return (
                    <div key={rp.id} className="py-3 first:pt-0 last:pb-0">
                      <Link href={rpUrl} className="group">
                        <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {rp.subjectName}
                        </div>
                        <div className="flex gap-2 text-xxs text-slate-400 mt-1">
                          <span>{rp.year}</span>
                          <span>•</span>
                          <span>{rp.examType}</span>
                          <span>•</span>
                          <span>{rp.semester}</span>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No other papers found for this subject.</p>
            )}
          </div>
        </div>
      </div>

      {/* Feedback modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowFeedbackModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 font-bold text-lg"
            >
              &times;
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Report an Issue</h3>

            {feedbackSuccess ? (
              <div className="py-8 text-center">
                <span className="text-4xl">✅</span>
                <h4 className="font-bold text-slate-900 mt-2">Report Submitted!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Thank you. Our moderators will review this paper shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={submitFeedback} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Issue Type
                  </label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Wrong Paper">Wrong Paper / Different Subject</option>
                    <option value="Blurry PDF">Blurry / Unreadable PDF</option>
                    <option value="Incorrect Metadata">Incorrect Year / Course Info</option>
                    <option value="Other">Other Problem</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Message / Explanation
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder="Provide details about the issue so we can fix it..."
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {submittingFeedback ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
