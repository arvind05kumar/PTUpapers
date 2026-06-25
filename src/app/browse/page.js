'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PaperCard from '@/components/PaperCard';
import Breadcrumbs from '@/components/Breadcrumbs';

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for all papers (loaded once from API) and filtered papers
  const [allPapers, setAllPapers] = useState([]);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter selections
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial load: Fetch all papers to run client-side interlocked filtering
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/papers');
        const data = await res.json();
        setAllPapers(data.papers || []);
      } catch (err) {
        console.error('Failed to load papers', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update selected filters when URL searchParams change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedBranch(searchParams.get('branch') || '');
    setSelectedSemester(searchParams.get('semester') || '');
    setSelectedSubjectCode(searchParams.get('subjectCode') || '');
    setSelectedYear(searchParams.get('year') || '');
    setSelectedExamType(searchParams.get('examType') || '');
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Execute filtering when states or allPapers change
  useEffect(() => {
    let filtered = [...allPapers];

    if (selectedBranch) {
      filtered = filtered.filter((p) => p.branch === selectedBranch);
    }
    if (selectedSemester) {
      filtered = filtered.filter((p) => p.semester === selectedSemester);
    }
    if (selectedSubjectCode) {
      filtered = filtered.filter((p) => p.subjectCode === selectedSubjectCode);
    }
    if (selectedYear) {
      filtered = filtered.filter((p) => p.year === parseInt(selectedYear));
    }
    if (selectedExamType) {
      filtered = filtered.filter((p) => p.examType === selectedExamType);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.subjectName.toLowerCase().includes(q) ||
          p.subjectCode.toLowerCase().includes(q) ||
          p.branch.toLowerCase().includes(q) ||
          p.year.toString().includes(q)
      );
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPapers(filtered);
  }, [
    allPapers,
    selectedBranch,
    selectedSemester,
    selectedSubjectCode,
    selectedYear,
    selectedExamType,
    searchQuery,
  ]);

  // Helper to push URL query param updates
  const updateURLParams = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    // Reset dependant filters if higher levels change
    if ('branch' in updates) {
      params.delete('semester');
      params.delete('subjectCode');
    }
    if ('semester' in updates) {
      params.delete('subjectCode');
    }
    router.push(`/browse?${params.toString()}`);
  };

  const handleClearFilters = () => {
    router.push('/browse');
  };

  // --- Compute INTERLOCKED dynamic dropdown options ---
  
  // 1. Branches: always all branches in database
  const branchOptions = [...new Set(allPapers.map((p) => p.branch))].sort();

  // 2. Semesters: only semesters that exist for the selected branch
  const semesterOptions = [
    ...new Set(
      allPapers
        .filter((p) => !selectedBranch || p.branch === selectedBranch)
        .map((p) => p.semester)
    ),
  ].sort((a, b) => {
    const getNum = (str) => {
      const match = str.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    };
    return getNum(a) - getNum(b);
  });

  // 3. Subjects: only subjects that exist for selected branch + semester
  const subjectOptions = allPapers
    .filter((p) => {
      const matchBranch = !selectedBranch || p.branch === selectedBranch;
      const matchSem = !selectedSemester || p.semester === selectedSemester;
      return matchBranch && matchSem;
    })
    .reduce((acc, p) => {
      if (!acc.some((s) => s.code === p.subjectCode)) {
        acc.push({ name: p.subjectName, code: p.subjectCode });
      }
      return acc;
    }, [])
    .sort((a, b) => a.name.localeCompare(b.name));

  // 4. Years: only years that exist for selected branch + semester + subject
  const yearOptions = [
    ...new Set(
      allPapers
        .filter((p) => {
          const matchBranch = !selectedBranch || p.branch === selectedBranch;
          const matchSem = !selectedSemester || p.semester === selectedSemester;
          const matchSubj = !selectedSubjectCode || p.subjectCode === selectedSubjectCode;
          return matchBranch && matchSem && matchSubj;
        })
        .map((p) => p.year)
    ),
  ].sort((a, b) => b - a);

  // 5. Exam Types: only exam types that exist for selected branch + semester + subject
  const examTypeOptions = [
    ...new Set(
      allPapers
        .filter((p) => {
          const matchBranch = !selectedBranch || p.branch === selectedBranch;
          const matchSem = !selectedSemester || p.semester === selectedSemester;
          const matchSubj = !selectedSubjectCode || p.subjectCode === selectedSubjectCode;
          return matchBranch && matchSem && matchSubj;
        })
        .map((p) => p.examType)
    ),
  ].sort();

  // Create breadcrumbs array dynamically
  const breadcrumbItems = [];
  if (selectedBranch) {
    breadcrumbItems.push({
      label: selectedBranch,
      href: `/browse?branch=${encodeURIComponent(selectedBranch)}`,
    });
  }
  if (selectedSemester) {
    breadcrumbItems.push({
      label: selectedSemester,
      href: `/browse?branch=${encodeURIComponent(selectedBranch)}&semester=${encodeURIComponent(
        selectedSemester
      )}`,
    });
  }
  if (selectedSubjectCode && papers.length > 0) {
    breadcrumbItems.push({
      label: papers[0].subjectName,
    });
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
        {/* Top Path Navigation */}
        <div className="mb-4">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Headline */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl tracking-tight">
              {selectedBranch ? `${selectedBranch} Papers` : 'All Question Papers'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Filter by course, semester, subject, and year to find your exams.
            </p>
          </div>
        </div>

        {/* Filter Controls Panel */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs mb-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 items-end">
            
            {/* Search Input */}
            <div className="lg:col-span-2">
              <label htmlFor="search" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Search Papers
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => updateURLParams({ search: e.target.value })}
                  placeholder="Subject, code, year..."
                  className="block w-full rounded-lg border border-slate-350 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Branch Filter */}
            <div>
              <label htmlFor="branch" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Course/Branch
              </label>
              <select
                id="branch"
                value={selectedBranch}
                onChange={(e) => updateURLParams({ branch: e.target.value })}
                className="block w-full rounded-lg border border-slate-350 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Branches</option>
                {branchOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester Filter */}
            <div>
              <label htmlFor="semester" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Semester
              </label>
              <select
                id="semester"
                value={selectedSemester}
                disabled={!selectedBranch}
                onChange={(e) => updateURLParams({ semester: e.target.value })}
                className="block w-full rounded-lg border border-slate-350 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">All Semesters</option>
                {semesterOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <label htmlFor="subject" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Subject
              </label>
              <select
                id="subject"
                value={selectedSubjectCode}
                disabled={!selectedSemester}
                onChange={(e) => updateURLParams({ subjectCode: e.target.value })}
                className="block w-full rounded-lg border border-slate-350 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">All Subjects</option>
                {subjectOptions.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.name} ({opt.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label htmlFor="year" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Exam Year
              </label>
              <select
                id="year"
                value={selectedYear}
                onChange={(e) => updateURLParams({ year: e.target.value })}
                className="block w-full rounded-lg border border-slate-350 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Years</option>
                {yearOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters row */}
          {(selectedBranch || selectedSemester || selectedSubjectCode || selectedYear || selectedExamType || searchQuery) && (
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Active filters:</span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">
                    Search: &quot;{searchQuery}&quot;
                    <button onClick={() => updateURLParams({ search: null })} className="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
                  </span>
                )}
                {selectedBranch && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">
                    {selectedBranch}
                    <button onClick={() => updateURLParams({ branch: null })} className="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
                  </span>
                )}
                {selectedSemester && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">
                    {selectedSemester}
                    <button onClick={() => updateURLParams({ semester: null })} className="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
                  </span>
                )}
                {selectedSubjectCode && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">
                    Subject Code: {selectedSubjectCode}
                    <button onClick={() => updateURLParams({ subjectCode: null })} className="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
                  </span>
                )}
                {selectedYear && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">
                    Year: {selectedYear}
                    <button onClick={() => updateURLParams({ year: null })} className="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
                  </span>
                )}
              </div>
              
              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-800">{papers.length}</span> papers
        </div>

        {/* Paper Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 h-48">
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-3"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-slate-200 rounded w-full mt-auto"></div>
              </div>
            ))}
          </div>
        ) : papers.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {papers.map((paper) => (
              <PaperCard key={paper.id} paper={paper} />
            ))}
          </div>
        ) : (
          /* Graceful "no results" state with recommendations */
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center max-w-xl mx-auto mt-8">
            <span className="text-4xl mb-4 block">🔍</span>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No question papers found</h3>
            <p className="text-sm text-slate-500 mb-6">
              We couldn&apos;t find any papers matching your current filters. Try loosening your filters or resetting the search query.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleClearFilters}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                Reset all filters
              </button>
              {selectedBranch && !selectedSemester && (
                <button
                  onClick={() => updateURLParams({ branch: null })}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Clear Course Filter
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <div className="text-center text-slate-500">Loading browse panel...</div>
        </div>
      }
    >
      <BrowseContent />
    </Suspense>
  );
}
