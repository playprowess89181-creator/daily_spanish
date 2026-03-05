'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import ProfileNavbar from '../../../components/ProfileNavbar';
import { withAuth } from '../../../../lib/AuthContext';

const API_LESSONS_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '') + '/api/lessons';

function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

function toBackendMediaUrl(url: string | null) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '');
  if (!base) return url;
  if (url.startsWith('/')) return `${base}${url}`;
  return `${base}/${url}`;
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

type LessonDetail = {
  id: string;
  block: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  created_at: string;
  updated_at: string;
  video_type: 'upload' | 'link' | null;
  video_file: string | null;
  video_url: string | null;
  lesson_pdf: string | null;
  keys_pdf: string | null;
  has_lesson_pdf: boolean;
  has_keys_pdf: boolean;
};

function LessonWatchPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
  const backBlock = searchParams.get('block') || '';

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [popup, setPopup] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token || !id) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_LESSONS_BASE}/lessons/${encodeURIComponent(id)}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data?.error || 'Failed to load lesson');
          setLesson(null);
          return;
        }
        if (!cancelled) setLesson(data.lesson as LessonDetail);
      } catch {
        if (!cancelled) setError('Network error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const embedUrl = useMemo(() => getEmbedUrl(lesson?.video_url || ''), [lesson?.video_url]);

  const downloadLessonPdf = () => {
    if (!lesson?.lesson_pdf) {
      setPopup({ title: 'Not available', message: 'Lesson PDF is not available.' });
      return;
    }
    const url = toBackendMediaUrl(lesson.lesson_pdf);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const downloadKeysPdf = () => {
    if (!lesson?.keys_pdf) {
      setPopup({ title: 'Not available', message: 'Keys PDF is not available.' });
      return;
    }
    const url = toBackendMediaUrl(lesson.keys_pdf);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const goBack = () => {
    if (backBlock) {
      router.push(`/dashboard?tab=my-courses&block=${encodeURIComponent(backBlock)}`);
      return;
    }
    router.push('/dashboard?tab=my-courses');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <ProfileNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="text-sm text-gray-600">Dashboard / Lessons</div>
            <h1 className="text-2xl font-bold text-gray-900">Lesson Video</h1>
          </div>
          <button
            onClick={goBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200"
          >
            <i className="fas fa-arrow-left"></i>
            Back to lessons
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700">
            {error}
          </div>
        )}

        {loading || !lesson ? (
          <div className="glass-effect rounded-xl p-6 border border-white/20 text-gray-700">
            {loading ? 'Loading lesson...' : 'Lesson not found'}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <div className="glass-effect rounded-2xl border border-white/20 overflow-hidden">
                <div className="px-5 py-4 border-b border-white/30 bg-white/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">Level</div>
                      <div className="text-lg font-semibold text-gray-900">{lesson.block}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border bg-white">
                        <i className="fas fa-hashtag"></i>
                        {lesson.id}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="aspect-video bg-black">
                  {lesson.video_file ? (
                    <video src={toBackendMediaUrl(lesson.video_file)} controls className="w-full h-full object-contain" />
                  ) : lesson.video_url && embedUrl ? (
                    <iframe
                      src={embedUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Lesson video"
                    />
                  ) : lesson.video_url && isDirectVideoUrl(lesson.video_url) ? (
                    <video src={lesson.video_url} controls className="w-full h-full object-contain" />
                  ) : lesson.video_url ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-sm text-white/80 gap-3 px-6 text-center">
                      <div>This video link cannot be embedded here.</div>
                      <a
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20"
                        href={lesson.video_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <i className="fas fa-external-link-alt"></i>
                        Open video link
                      </a>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-white/80">
                      No video available.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="glass-effect rounded-2xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-semibold text-gray-900">Downloads</div>
                  <div className="text-xs text-gray-600">PDFs</div>
                </div>

                <button
                  onClick={downloadLessonPdf}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${lesson.has_lesson_pdf ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      <i className="fas fa-file-pdf"></i>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-gray-900">Lesson PDF</div>
                      <div className="text-xs text-gray-600">{lesson.has_lesson_pdf ? 'Download available' : 'Not available'}</div>
                    </div>
                  </div>
                  <i className="fas fa-download text-gray-400"></i>
                </button>

                <button
                  onClick={downloadKeysPdf}
                  className="mt-3 w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${lesson.has_keys_pdf ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      <i className="fas fa-key"></i>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-gray-900">Keys PDF</div>
                      <div className="text-xs text-gray-600">{lesson.has_keys_pdf ? 'Download available' : 'Not available'}</div>
                    </div>
                  </div>
                  <i className="fas fa-download text-gray-400"></i>
                </button>
              </div>

              <div className="glass-effect rounded-2xl border border-white/20 p-6">
                <div className="text-lg font-semibold text-gray-900 mb-3">How to use this lesson</div>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center border">
                      <i className="fas fa-play text-gray-700"></i>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Watch first</div>
                      <div className="text-gray-600">Focus on key phrases and pronunciation patterns.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center border">
                      <i className="fas fa-file-alt text-gray-700"></i>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Download PDFs</div>
                      <div className="text-gray-600">Use the lesson PDF to review, and keys to check answers.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center border">
                      <i className="fas fa-repeat text-gray-700"></i>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Repeat & practice</div>
                      <div className="text-gray-600">Rewatch tricky sections and repeat aloud for retention.</div>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        )}
      </main>

      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="text-base font-semibold text-gray-900">{popup.title}</div>
              <button className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100" onClick={() => setPopup(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="px-5 py-4 text-sm text-gray-700">{popup.message}</div>
            <div className="px-5 py-4 flex justify-end">
              <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200" onClick={() => setPopup(null)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(LessonWatchPage);
