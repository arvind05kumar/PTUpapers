'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function AdminPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'manage' | 'feedback'

  // Form Fields
  const [branch, setBranch] = useState('B.Tech CSE');
  const [customBranch, setCustomBranch] = useState('');
  const [semester, setSemester] = useState('Semester 1');
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [examType, setExamType] = useState('End-term');
  const [selectedFile, setSelectedFile] = useState(null);

  // List States
  const [papers, setPapers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  // Status indicators
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' }); // 'success' | 'error' | 'loading'

  // Check authentication status on load
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Failed to check auth status', err);
      } finally {
        setAuthChecked(true);
      }
    }
    checkAuth();
  }, []);

  // Load lists if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadPapers();
      loadFeedbacks();
    }
  }, [isAuthenticated]);

  const loadPapers = async () => {
    setLoadingList(true);
    try {
      const res = await fetch('/api/papers');
      const data = await res.json();
      setPapers(data.papers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  const loadFeedbacks = async () => {
    try {
      const res = await fetch('/api/feedback');
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.feedbacks || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
      } else {
        setLoginError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setLoginError('Error connecting to authentication API');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      setIsAuthenticated(false);
      setPassword('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadPaper = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadStatus({ type: 'error', message: 'Please select a PDF file to upload.' });
      return;
    }

    setUploadStatus({ type: 'loading', message: 'Uploading PDF file...' });

    try {
      // 1. Upload File
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        throw new Error(uploadData.message || 'File upload failed');
      }

      // 2. Submit Paper Metadata
      setUploadStatus({ type: 'loading', message: 'Saving paper metadata...' });
      const finalBranch = branch === 'Other' ? customBranch : branch;

      const paperRes = await fetch('/api/papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch: finalBranch,
          semester,
          subjectName,
          subjectCode,
          year: parseInt(year),
          examType,
          pdfUrl: uploadData.url,
        }),
      });

      const paperData = await paperRes.json();
      if (paperData.success) {
        setUploadStatus({ type: 'success', message: 'Question Paper uploaded successfully!' });
        // Reset inputs
        setSubjectName('');
        setSubjectCode('');
        setSelectedFile(null);
        setCustomBranch('');
        // Clear file input DOM element
        const fileInput = document.getElementById('pdf-file');
        if (fileInput) fileInput.value = '';
        // Reload list
        loadPapers();
      } else {
        throw new Error(paperData.message || 'Failed to save paper metadata');
      }
    } catch (err) {
      setUploadStatus({ type: 'error', message: err.message || 'An error occurred during upload.' });
    }
  };

  const handleDeletePaper = async (id) => {
    if (!confirm('Are you sure you want to delete this paper? This will delete the database record and remove the PDF file permanently.')) return;

    try {
      const res = await fetch(`/api/papers/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setPapers(papers.filter((p) => p.id !== id));
        // Reload feedbacks because some references might change
        loadFeedbacks();
      } else {
        alert(data.message || 'Failed to delete paper');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while deleting paper');
    }
  };

  const getPaperUrl = (paper) => {
    const cleanBranch = encodeURIComponent(paper.branch.toLowerCase().replace(/\s+/g, '-'));
    const cleanSem = encodeURIComponent(paper.semester.toLowerCase().replace(/\s+/g, '-'));
    const cleanSubject = encodeURIComponent(paper.subjectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    return `/papers/${cleanBranch}/${cleanSem}/${cleanSubject}/${paper.year}?id=${paper.id}`;
  };

  const breadcrumbItems = [{ label: 'Admin Panel' }];

  if (!authChecked) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-500">Checking session credentials...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Dynamic State: Login Form vs Dashboard */}
        {!isAuthenticated ? (
          <div className="mx-auto max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm mt-12">
            <div className="text-center mb-6">
              <span className="text-4xl">🔐</span>
              <h1 className="text-2xl font-bold text-slate-900 mt-2">Admin Authentication</h1>
              <p className="text-xs text-slate-500 mt-1">Enter the administrator password to manage archives.</p>
            </div>

            {loginError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200 mb-4 text-center">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="pass" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  id="pass"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full rounded-lg border border-slate-350 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loggingIn}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loggingIn ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          </div>
        ) : (
          /* Logged In Dashboard */
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <div>
                <h1 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl tracking-tight">
                  Admin Dashboard
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Upload new papers, monitor statistics, and view reported user issues.
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors self-start sm:self-auto"
              >
                Sign Out
              </button>
            </div>

            {/* Dashboard Tabs Selector */}
            <div className="border-b border-slate-200 mb-6">
              <nav className="flex space-x-6" aria-label="Dashboard Panels">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`border-b-2 py-4 px-1 text-sm font-semibold transition-colors focus:outline-none ${
                    activeTab === 'upload'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  Upload Paper
                </button>
                <button
                  onClick={() => setActiveTab('manage')}
                  className={`border-b-2 py-4 px-1 text-sm font-semibold transition-colors focus:outline-none ${
                    activeTab === 'manage'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  Manage Papers ({papers.length})
                </button>
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`border-b-2 py-4 px-1 text-sm font-semibold transition-colors focus:outline-none ${
                    activeTab === 'feedback'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  Reported Issues ({feedbacks.length})
                </button>
              </nav>
            </div>

            {/* TAB CONTENTS */}
            
            {/* 1. Upload Form Tab */}
            {activeTab === 'upload' && (
              <div className="max-w-2xl bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                <h2 className="text-base font-bold text-slate-900 mb-6 border-b border-slate-100 pb-3">
                  Upload Question Paper
                </h2>

                {uploadStatus.message && (
                  <div
                    className={`rounded-lg p-3 text-sm border mb-5 text-center ${
                      uploadStatus.type === 'success'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : uploadStatus.type === 'error'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {uploadStatus.message}
                  </div>
                )}

                <form onSubmit={handleUploadPaper} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    
                    {/* Branch select */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Course / Branch
                      </label>
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="B.Tech CSE">B.Tech CSE</option>
                        <option value="B.Tech ECE">B.Tech ECE</option>
                        <option value="B.Tech ME">B.Tech ME</option>
                        <option value="B.Tech EE">B.Tech EE</option>
                        <option value="BCA">BCA</option>
                        <option value="MBA">MBA</option>
                        <option value="Other">Other / Custom Course</option>
                      </select>
                    </div>

                    {/* Custom Branch input */}
                    {branch === 'Other' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Custom Course Name
                        </label>
                        <input
                          type="text"
                          required
                          value={customBranch}
                          onChange={(e) => setCustomBranch(e.target.value)}
                          placeholder="e.g. M.Tech CSE"
                          className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    )}

                    {/* Semester select */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Semester
                      </label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                      >
                        {[...Array(8)].map((_, i) => (
                          <option key={i} value={`Semester ${i + 1}`}>
                            Semester {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Subject Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Subject Name
                      </label>
                      <input
                        type="text"
                        required
                        value={subjectName}
                        onChange={(e) => setSubjectName(e.target.value)}
                        placeholder="e.g. Compiler Design"
                        className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Subject Code */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Subject Code
                      </label>
                      <input
                        type="text"
                        required
                        value={subjectCode}
                        onChange={(e) => setSubjectCode(e.target.value)}
                        placeholder="e.g. BTCS-502"
                        className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Year */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Exam Year
                      </label>
                      <input
                        type="number"
                        required
                        min="2000"
                        max="2035"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Exam Type */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Exam Type
                      </label>
                      <select
                        value={examType}
                        onChange={(e) => setExamType(e.target.value)}
                        className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="End-term">End-term</option>
                        <option value="Mid-term">Mid-term</option>
                        <option value="Supplementary">Supplementary</option>
                      </select>
                    </div>
                  </div>

                  {/* File selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Upload PDF File
                    </label>
                    <input
                      type="file"
                      id="pdf-file"
                      required
                      accept="application/pdf"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 file:shadow-xs file:hover:bg-blue-100 file:transition-colors cursor-pointer border border-slate-200 rounded-lg p-2"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={uploadStatus.type === 'loading'}
                      className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {uploadStatus.type === 'loading' ? 'Processing...' : 'Upload Question Paper'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. Manage Papers Tab */}
            {activeTab === 'manage' && (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="text-sm font-bold text-slate-700">Uploaded Papers</h3>
                  <button
                    onClick={loadPapers}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Refresh List
                  </button>
                </div>

                {loadingList ? (
                  <div className="p-12 text-center text-slate-500">Loading list of papers...</div>
                ) : papers.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">No question papers uploaded yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 min-w-[700px]">
                      <thead className="bg-slate-50/50 text-xs font-bold text-slate-500 border-b border-slate-100 uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-3">Subject</th>
                          <th className="px-6 py-3">Branch</th>
                          <th className="px-6 py-3">Sem</th>
                          <th className="px-6 py-3">Year</th>
                          <th className="px-6 py-3 text-center">Views</th>
                          <th className="px-6 py-3 text-center">Downloads</th>
                          <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {papers.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <a
                                href={getPaperUrl(p)}
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-slate-900 hover:underline hover:text-blue-600 block max-w-xs truncate"
                              >
                                {p.subjectName}
                              </a>
                              <span className="text-xxs font-mono text-slate-400">{p.subjectCode} • {p.examType}</span>
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold">{p.branch}</td>
                            <td className="px-6 py-4 text-xs">{p.semester}</td>
                            <td className="px-6 py-4 text-xs font-bold text-slate-800">{p.year}</td>
                            <td className="px-6 py-4 text-xs text-center">{p.viewCount}</td>
                            <td className="px-6 py-4 text-xs text-center">{p.downloadCount}</td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeletePaper(p.id)}
                                className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 3. Student Issues / Feedback Tab */}
            {activeTab === 'feedback' && (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="text-sm font-bold text-slate-700">Reported Issues</h3>
                  <button
                    onClick={loadFeedbacks}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Refresh List
                  </button>
                </div>

                {feedbacks.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">No issues reported by students! Everything looks clean.</div>
                ) : (
                  <div className="divide-y divide-slate-150">
                    {feedbacks.map((f) => (
                      <div key={f.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                            f.issueType === 'Wrong Paper'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : f.issueType === 'Blurry PDF'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {f.issueType}
                          </span>
                          <span className="text-xxs text-slate-400">
                            Reported on {new Date(f.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {f.paper ? (
                          <div className="mb-3">
                            <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider mb-0.5">Associated Paper</span>
                            <a
                              href={getPaperUrl(f.paper)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-bold text-slate-800 hover:underline hover:text-blue-600"
                            >
                              {f.paper.subjectName} ({f.paper.subjectCode})
                            </a>
                            <span className="text-xxs text-slate-500 block mt-0.5">
                              {f.paper.branch} • {f.paper.semester} • {f.paper.year}
                            </span>
                          </div>
                        ) : (
                          <div className="mb-3 text-xs text-red-500 font-semibold">
                            Associated paper was deleted.
                          </div>
                        )}

                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700 font-medium">
                          {f.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
