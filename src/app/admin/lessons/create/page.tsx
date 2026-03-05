'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { withAdminAuth } from '../../../../lib/AuthContext';

const API_LESSONS_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '') + '/api/lessons';

function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

function getEmbedUrl(input: string) {
  const raw = (input || '').trim();
  if (!raw) return '';
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${encodeURIComponent(v)}`;
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts[0] === 'embed' && parts[1]) return `https://www.youtube.com/embed/${encodeURIComponent(parts[1])}`;
      if (parts[0] === 'shorts' && parts[1]) return `https://www.youtube.com/embed/${encodeURIComponent(parts[1])}`;
      if (parts[0] === 'live' && parts[1]) return `https://www.youtube.com/embed/${encodeURIComponent(parts[1])}`;
    }
    if (host === 'youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (id) return `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
    }
    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const parts = u.pathname.split('/').filter(Boolean);
      const id = host === 'player.vimeo.com' ? (parts[0] === 'video' ? parts[1] : null) : parts[0];
      if (id) return `https://player.vimeo.com/video/${encodeURIComponent(id)}`;
    }
  } catch {}
  return '';
}

function isDirectVideoUrl(input: string) {
  const url = (input || '').toLowerCase();
  return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg') || url.endsWith('.mov') || url.endsWith('.m4v');
}

function CreateLessonPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const [block, setBlock] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1'>('A1');
  const [videoSource, setVideoSource] = useState<'upload' | 'link'>('upload');

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [lessonPdf, setLessonPdf] = useState<File | null>(null);
  const [keysPdf, setKeysPdf] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = useMemo(() => (videoFile ? URL.createObjectURL(videoFile) : ''), [videoFile]);
  const embedUrl = useMemo(() => getEmbedUrl(videoUrl), [videoUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const token = getAccessToken();
    if (!token) {
      setError('Not authenticated');
      return;
    }

    if (videoSource === 'upload' && !videoFile) {
      setError('Please select a video file');
      return;
    }
    if (videoSource === 'link' && !videoUrl.trim()) {
      setError('Please enter a video link');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('block', block);
      if (videoSource === 'upload' && videoFile) fd.append('video_file', videoFile);
      if (videoSource === 'link') fd.append('video_url', videoUrl.trim());
      if (lessonPdf) fd.append('lesson_pdf', lessonPdf);
      if (keysPdf) fd.append('keys_pdf', keysPdf);

      const res = await fetch(`${API_LESSONS_BASE}/lessons/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Failed to create lesson');
        return;
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lessons:created'));
        window.dispatchEvent(new CustomEvent('lessons:changed'));
      }
      router.push('/admin/lessons');
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} activeItem="lessons" />

      <div className="lg:ml-64 flex flex-col flex-1">
        <Header title="Create Lesson" onToggleSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-6">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">New Lesson</h2>
                <div className="text-sm text-gray-600">Upload a video or paste a link, optionally attach PDFs.</div>
              </div>
              <Link href="/admin/lessons" className="px-3 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200">
                Back to list
              </Link>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-effect rounded-xl p-6 border border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={block}
                      onChange={(e) => setBlock(e.target.value as any)}
                    >
                      <option value="A1">A1 – Beginner</option>
                      <option value="A2">A2 – Basic</option>
                      <option value="B1">B1 – Intermediate</option>
                      <option value="B2">B2 – Upper Intermediate</option>
                      <option value="C1">C1 – Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Video Source</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setVideoSource('upload')}
                        className={`flex-1 px-3 py-2 rounded-md border text-sm font-medium ${
                          videoSource === 'upload'
                            ? 'bg-white border-blue-200 text-blue-700 shadow-sm'
                            : 'bg-white/70 border-gray-200 text-gray-700 hover:bg-white'
                        }`}
                      >
                        <i className="fas fa-upload mr-2"></i>
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoSource('link')}
                        className={`flex-1 px-3 py-2 rounded-md border text-sm font-medium ${
                          videoSource === 'link'
                            ? 'bg-white border-blue-200 text-blue-700 shadow-sm'
                            : 'bg-white/70 border-gray-200 text-gray-700 hover:bg-white'
                        }`}
                      >
                        <i className="fas fa-link mr-2"></i>
                        Link
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  {videoSource === 'upload' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Video File</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors bg-white/70">
                        <input
                          type="file"
                          accept="video/*"
                          className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          onChange={(e) => setVideoFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                        />
                        <div className="mt-2 text-xs text-gray-600">MP4/WebM recommended.</div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Video Link</label>
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                      <div className="mt-2 text-xs text-gray-600">YouTube/Vimeo links will be embedded automatically.</div>
                    </div>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lesson PDF (optional)</label>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                      onChange={(e) => setLessonPdf(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                    />
                    {lessonPdf && <div className="mt-2 text-xs text-gray-600">{lessonPdf.name}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Keys PDF (optional)</label>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                      onChange={(e) => setKeysPdf(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                    />
                    {keysPdf && <div className="mt-2 text-xs text-gray-600">{keysPdf.name}</div>}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2">
                  <Link href="/admin/lessons" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200">
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg text-white shadow-sm disabled:opacity-60"
                    style={{ backgroundColor: 'var(--azul-ultramar)' }}
                  >
                    {submitting ? 'Creating...' : 'Create Lesson'}
                  </button>
                </div>
              </div>

              <div className="glass-effect rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">Preview</div>
                    <div className="text-sm text-gray-600">Confirm the video looks correct before saving.</div>
                  </div>
                  <div className="text-xs text-gray-600">
                    {videoSource === 'upload' ? 'Uploaded video' : 'Embedded link'}
                  </div>
                </div>

                <div className="mt-4 rounded-2xl overflow-hidden border border-gray-200 bg-white">
                  <div className="aspect-video bg-black">
                    {videoSource === 'upload' ? (
                      previewUrl ? (
                        <video src={previewUrl} controls className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-white/80">
                          Select a video file to preview.
                        </div>
                      )
                    ) : embedUrl ? (
                      <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Lesson video preview"
                      />
                    ) : videoUrl.trim() && isDirectVideoUrl(videoUrl.trim()) ? (
                      <video src={videoUrl.trim()} controls className="w-full h-full object-contain" />
                    ) : videoUrl.trim() ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-sm text-white/80 gap-2 px-6 text-center">
                        <div>Preview is not available for this link type.</div>
                        <a
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20"
                          href={videoUrl.trim()}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <i className="fas fa-external-link-alt"></i>
                          Open link
                        </a>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-white/80">
                        Paste a video link to preview.
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="text-sm font-semibold text-gray-900 mb-1">Lesson PDF</div>
                    <div className="text-xs text-gray-600">
                      {lessonPdf ? lessonPdf.name : 'Not attached'}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="text-sm font-semibold text-gray-900 mb-1">Keys PDF</div>
                    <div className="text-xs text-gray-600">
                      {keysPdf ? keysPdf.name : 'Not attached'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                  <div className="text-sm font-semibold text-gray-900 mb-1">How downloads work</div>
                  <div className="text-xs text-gray-600">
                    Uploaded PDFs will show as downloadable buttons on the lesson video page. If a PDF is not uploaded, users will see a message that it is unavailable.
                  </div>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default withAdminAuth(CreateLessonPage);
