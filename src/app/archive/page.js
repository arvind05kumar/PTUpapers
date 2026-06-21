'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function ArchivePage() {
  const [papers, setPapers] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/papers');
        const data = await res.json();
        const papersList = data.papers || [];
        setPapers(papersList);

        // Extract unique years and sort descending
        const uniqueYears = [...new Set(papersList.map((p) => p.year))].sort((a, b) => b - a);
        setYears(uniqueYears);

        // Default to the latest year
        if (uniqueYears.length > 0) {
          setSelectedYear(uniqueYears[0]);
        }
      } catch (err) {
        console.error('Failed to load archive data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter papers by selected year
  const papersForSelectedYear = papers.filter((p) => p.year === selectedYear);

  // Group papers of selected year by Branch
  const groupedPapers = papersForSelectedYear.reduce((acc, paper) => {
    if (!acc[paper.branch]) {
      acc[paper.branch] = [];
    }
    acc[paper.branch].push(paper);
    return acc;
  }, {});

  const getPaperUrl = (paper) => {
    const cleanBranch = encodeURIComponent(paper.branch.toLowerCase().replace(/\s+/g, '-'));
    const cleanSem = encodeURIComponent(paper.semester.toLowerCase().replace(/\s+/g, '-'));
    const cleanSubject = encodeURIComponent(paper.subjectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    return `/papers/${cleanBranch}/${cleanSem}/${cleanSubject}/${paper.year}?id=${paper.id}`;
  };

  const breadcrumbItems = [{ label: 'Year Archive' }];

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
            Year-wise Archive
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Browse all semester question papers grouped by exam year and course.
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-slate-500">Loading archives...</div>
          </div>
        ) : years.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-350 p-12 text-center text-slate-500 bg-white">
            No question papers found in the database.
          </div>
        ) : (
          <div className="space-y-8">
            {/* Year Selector Tabs */}
            <div className="border-b border-slate-200">
              <nav className="flex space-x-4" aria-label="Tabs">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`border-b-2 py-4 px-1 text-sm font-semibold transition-colors focus:outline-none ${
                      selectedYear === year
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                    }`}
                  >
                    Exams of {year}
                  </button>
                ))}
              </nav>
            </div>

            {/* List of Branches for selected year */}
            <div className="space-y-8">
              {Object.keys(groupedPapers).length > 0 ? (
                Object.entries(groupedPapers).map(([branchName, branchPapers]) => (
                  <div
                    key={branchName}
                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs"
                  >
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                      <span className="text-xl">🎓</span>
                      <h2 className="text-lg font-bold text-slate-900">{branchName}</h2>
                      <span className="ml-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                        {branchPapers.length} papers
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {branchPapers.map((paper) => (
                        <Link
                          key={paper.id}
                          href={getPaperUrl(paper)}
                          className="flex flex-col justify-between rounded-lg border border-slate-100 p-4 hover:border-blue-200 hover:bg-blue-50/10 transition-all hover:shadow-xs group"
                        >
                          <div>
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.25 text-xxs font-medium text-slate-600 mb-2">
                              {paper.semester}
                            </span>
                            <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                              {paper.subjectName}
                            </h3>
                            <p className="text-xs font-mono text-slate-400 mt-1">
                              {paper.subjectCode}
                            </p>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xxs text-slate-400 border-t border-slate-50 pt-2">
                            <span>{paper.examType}</span>
                            <span className="text-blue-600 font-semibold group-hover:underline">
                              Preview &rarr;
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500">
                  No papers found for the year {selectedYear}.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
