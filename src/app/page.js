'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PaperCard from '@/components/PaperCard';

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentPapers, setRecentPapers] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  // Debounced search for live search dropdown
  useEffect(() => {
    if (query.trim().length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/papers?search=${encodeURIComponent(query)}&limit=5`);
        const data = await res.json();
        setSearchResults(data.papers || []);
      } catch (err) {
        console.error('Failed to fetch search results', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch recently added papers
  useEffect(() => {
    async function fetchRecent() {
      try {
        const res = await fetch('/api/papers?limit=4');
        const data = await res.json();
        setRecentPapers(data.papers || []);
      } catch (err) {
        console.error('Failed to fetch recent papers', err);
      } finally {
        setLoadingRecent(false);
      }
    }
    fetchRecent();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/browse?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const getPaperUrl = (paper) => {
    const cleanBranch = encodeURIComponent(paper.branch.toLowerCase().replace(/\s+/g, '-'));
    const cleanSem = encodeURIComponent(paper.semester.toLowerCase().replace(/\s+/g, '-'));
    const cleanSubject = encodeURIComponent(paper.subjectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    return `/papers/${cleanBranch}/${cleanSem}/${cleanSubject}/${paper.year}?id=${paper.id}`;
  };

  const branches = [
    { name: 'B.Tech CSE', icon: '💻', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { name: 'B.Tech ECE', icon: '📡', color: 'bg-sky-50 text-sky-700 border-sky-200' },
    { name: 'B.Tech ME', icon: '⚙️', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { name: 'BCA', icon: '📱', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'MBA', icon: '📈', color: 'bg-rose-50 text-rose-700 border-rose-200' }
  ];

  const popularSearches = [
    { label: 'Data Structures', query: 'Data Structures' },
    { label: 'Operating Systems', query: 'Operating Systems' },
    { label: 'Programming in C', query: 'Programming in C' },
    { label: 'Database Systems', query: 'Database Management' },
    { label: 'Digital Electronics', query: 'Digital Electronics' }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-6">
            Punjab Technical University (IKGPTU) Previous Papers
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Find the exact paper you need in{' '}
            <span className="text-blue-600">under 10 seconds</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600">
            A clean, modern repository built to help students discover and download
            official previous year semester exam papers easily. No ads, no popups.
          </p>

          {/* Search Bar Container */}
          <div className="relative mx-auto mt-10 max-w-2xl">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-5 w-5 text-slate-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by subject name, subject code (e.g. BTCS-301), or year..."
                  className="block w-full rounded-xl border border-slate-300 bg-white py-4 pl-10 pr-4 text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-base"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white shadow-md hover:bg-blue-700 transition-colors focus:outline-none text-base"
              >
                Search
              </button>
            </form>

            {/* Live Search Autocomplete Dropdown */}
            {query.trim().length > 0 && (
              <div className="absolute left-0 right-0 z-40 mt-2 rounded-xl border border-slate-200 bg-white shadow-xl max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center p-6 text-slate-500">
                    <svg className="animate-spin h-5 w-5 mr-3 text-blue-600" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Searching...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="p-2">
                    <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 tracking-wide uppercase border-b border-slate-100 mb-1">
                      Matching Papers
                    </div>
                    {searchResults.map((paper) => (
                      <Link
                        key={paper.id}
                        href={getPaperUrl(paper)}
                        className="flex flex-col px-3 py-2 hover:bg-slate-50 rounded-lg text-left transition-colors border border-transparent hover:border-slate-100"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 line-clamp-1">{paper.subjectName}</span>
                          <span className="text-xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.25 rounded border border-slate-200 shrink-0">{paper.subjectCode}</span>
                        </div>
                        <div className="flex gap-2 text-xs text-slate-500 mt-0.5">
                          <span>{paper.branch}</span>
                          <span>•</span>
                          <span>{paper.semester}</span>
                          <span>•</span>
                          <span>{paper.year}</span>
                          <span>•</span>
                          <span className="text-blue-600">{paper.examType}</span>
                        </div>
                      </Link>
                    ))}
                    <Link
                      href={`/browse?search=${encodeURIComponent(query)}`}
                      className="block text-center text-xs font-bold text-blue-600 hover:text-blue-700 py-3 border-t border-slate-100 mt-1 hover:bg-slate-50 rounded-b-lg transition-colors"
                    >
                      See all matching results
                    </Link>
                  </div>
                ) : (
                  <div className="p-6 text-slate-500 text-center">
                    No papers found matching <span className="font-semibold text-slate-800">&quot;{query}&quot;</span>.
                    <div className="text-xs mt-1 text-slate-400">Try browsing by Branch or searching another term.</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Popular Searches */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500">
            <span>Popular:</span>
            {popularSearches.map((s, idx) => (
              <Link
                key={idx}
                href={`/browse?search=${encodeURIComponent(s.query)}`}
                className="rounded-full bg-white border border-slate-200 px-3.5 py-1 text-xs font-medium text-slate-600 shadow-xs hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="flex-1 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Browse by Branch Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Browse by Course</h2>
            <Link
              href="/browse"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              View all courses &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {branches.map((branch, idx) => (
              <Link
                key={idx}
                href={`/browse?branch=${encodeURIComponent(branch.name)}`}
                className={`flex flex-col items-center justify-center rounded-2xl border p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-blue-300 ${branch.color}`}
              >
                <span className="text-3xl mb-3">{branch.icon}</span>
                <span className="text-sm font-bold tracking-tight">{branch.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Recently Added Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Recently Added Papers</h2>
              <p className="text-sm text-slate-500 mt-1">Stay updated with the latest uploads from final exams.</p>
            </div>
            <Link
              href="/browse"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Browse all papers &rarr;
            </Link>
          </div>

          {loadingRecent ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 h-48">
                  <div className="h-4 bg-slate-200 rounded w-1/4 mb-3"></div>
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-slate-200 rounded w-full mt-auto"></div>
                </div>
              ))}
            </div>
          ) : recentPapers.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {recentPapers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
              No papers found in the database. Please add papers via the Admin panel.
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center md:flex md:items-center md:justify-between">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link href="/browse" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Browse</Link>
            <Link href="/archive" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Archive</Link>
            <Link href="/bookmarks" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Bookmarks</Link>
            <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Admin Panel</Link>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-slate-500">
              &copy; {new Date().getFullYear()} PTU Papers Portal. Built for students, by students. This portal is not affiliated with I.K. Gujral Punjab Technical University.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
