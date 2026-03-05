'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { LessonFiltersState } from './LessonFilters';

const API_LESSONS_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '') + '/api/lessons';

function useAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

type Lesson = {
  id: string;
  block: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  created_by_email?: string;
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

export default function LessonsTable(props: { filters: LessonFiltersState }) {
  const { filters } = props;
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = useAccessToken();
  const [selected, setSelected] = useState<Lesson | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchLessons = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_LESSONS_BASE}/lessons/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        const list: Lesson[] = Array.isArray(data.lessons) ? data.lessons : [];
        setLessons(list);
      } else {
        setError(data.error || 'Failed to load lessons');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [token]);

  useEffect(() => {
    const handler = () => fetchLessons();
    if (typeof window !== 'undefined') {
      window.addEventListener('lessons:created', handler);
      window.addEventListener('lessons:updated', handler);
      window.addEventListener('lessons:deleted', handler);
      window.addEventListener('lessons:changed', handler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('lessons:created', handler);
        window.removeEventListener('lessons:updated', handler);
        window.removeEventListener('lessons:deleted', handler);
        window.removeEventListener('lessons:changed', handler);
      }
    };
  }, []);

  const openDelete = (lesson: Lesson) => {
    setSelected(lesson);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`${API_LESSONS_BASE}/lessons/${selected.id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data && data.error) ? data.error : 'Failed to delete lesson');
        return;
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lessons:deleted'));
        window.dispatchEvent(new CustomEvent('lessons:changed'));
      }
      setDeleteOpen(false);
      setSelected(null);
      await fetchLessons();
    } catch {
      setError('Network error');
    }
  };

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return lessons.filter((l) => {
      if (filters.block && l.block !== filters.block) return false;
      if (filters.videoType && (l.video_type || '') !== filters.videoType) return false;
      if (q && !String(l.id).toLowerCase().includes(q)) return false;

      const hasLesson = !!l.has_lesson_pdf;
      const hasKeys = !!l.has_keys_pdf;
      if (filters.pdf === 'any' && !(hasLesson || hasKeys)) return false;
      if (filters.pdf === 'lesson' && !hasLesson) return false;
      if (filters.pdf === 'keys' && !hasKeys) return false;
      if (filters.pdf === 'none' && (hasLesson || hasKeys)) return false;
      return true;
    });
  }, [filters.block, filters.pdf, filters.search, filters.videoType, lessons]);

  return (
    <div className="mt-6">
      {error && (
        <div className="mb-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg border border-red-200">{error}</div>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Lesson</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Level</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Video</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">PDFs</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Created</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td className="px-4 py-4" colSpan={6}>Loading...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-gray-600" colSpan={6}>No lessons found</td>
              </tr>
            ) : (
              filtered.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--azul-ultramar)', color: 'white' }}>
                        <i className="fas fa-book"></i>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{lesson.id}</div>
                        <div className="text-xs text-gray-500">by {lesson.created_by_email || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100">{lesson.block}</span>
                  </td>
                  <td className="px-4 py-4">
                    {lesson.video_type === 'upload' ? (
                      <span className="inline-flex items-center gap-2 px-2 py-1 text-xs rounded-md bg-orange-50 text-orange-700 border border-orange-100">
                        <i className="fas fa-upload"></i>
                        Uploaded
                      </span>
                    ) : lesson.video_type === 'link' ? (
                      <span className="inline-flex items-center gap-2 px-2 py-1 text-xs rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                        <i className="fas fa-link"></i>
                        Link
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-2 py-1 text-xs rounded-md bg-gray-50 text-gray-600 border border-gray-200">
                        <i className="fas fa-exclamation-triangle"></i>
                        Missing
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center gap-2 px-2 py-1 text-xs rounded-md border ${lesson.has_lesson_pdf ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        <i className="fas fa-file-pdf"></i>
                        Lesson
                      </span>
                      <span className={`inline-flex items-center gap-2 px-2 py-1 text-xs rounded-md border ${lesson.has_keys_pdf ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        <i className="fas fa-key"></i>
                        Keys
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">{new Date(lesson.created_at).toLocaleString()}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Link className="px-2.5 py-1.5 text-xs rounded-md border border-gray-300 hover:bg-gray-100" href={`/admin/lessons/${encodeURIComponent(lesson.id)}/edit`}>
                        <i className="fas fa-pen mr-1"></i> Edit
                      </Link>
                      <button className="px-2.5 py-1.5 text-xs rounded-md border border-red-300 text-red-700 hover:bg-red-50" onClick={() => openDelete(lesson)}>
                        <i className="fas fa-trash mr-1"></i> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border">
            <div className="px-5 py-4">
              <div className="text-base font-semibold mb-2">Delete Lesson</div>
              <div className="text-sm text-gray-700 mb-4">Are you sure you want to delete this lesson?</div>
              <div className="flex justify-end gap-2">
                <button className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-100" onClick={() => setDeleteOpen(false)}>Cancel</button>
                <button className="px-3 py-2 rounded-md text-white" style={{ backgroundColor: 'var(--azul-ultramar)' }} onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
