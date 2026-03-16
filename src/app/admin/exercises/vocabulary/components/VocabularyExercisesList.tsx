'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Item = {
  id: number;
  title: string;
  word_count: number;
  created_at: string;
};

export default function VocabularyExercisesList() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

  function useAccessToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  }

  const token = useAccessToken();

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/v1/vocabulary-exercises/exercise-sets`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!r.ok) return;
      const data = await r.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token, API_BASE]);

  const onDelete = async (id: number) => {
    if (!token) return;
    const ok = window.confirm('Delete this exercise? This cannot be undone.');
    if (!ok) return;
    setDeletingId(id);
    try {
      const r = await fetch(`${API_BASE}/api/v1/vocabulary-exercises/exercise-sets/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (r.ok) {
        await load();
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Exercises</h3>
        {loading && <span className="text-sm text-gray-500">Loading…</span>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((ex) => (
          <div key={ex.id} className="rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow bg-white">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{ex.title}</div>
                <div className="mt-1 text-xs text-gray-600">{ex.word_count} words</div>
                <div className="mt-1 text-xs text-gray-500">{new Date(ex.created_at).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/exercises/vocabulary/${ex.id}/edit`}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 text-xs"
                >
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(ex.id)}
                  disabled={deletingId === ex.id}
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 text-xs disabled:opacity-50"
                >
                  {deletingId === ex.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && !loading && (
          <div className="text-sm text-gray-600">No exercises found.</div>
        )}
      </div>
    </div>
  );
}
