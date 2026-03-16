'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { withAdminAuth } from '../../../../lib/AuthContext';

function DailyRoutinePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState<Array<{ id: number; title: string; sentence_count: number; created_at: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

  function getAccessToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  }

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/v1/daily-routine-exercises/exercise-sets`, {
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
  }, [API_BASE]);

  useEffect(() => {
    load();
  }, [load]);

  const onDelete = async (id: number) => {
    const ok = window.confirm('Delete this exercise? This cannot be undone.');
    if (!ok) return;
    const token = getAccessToken();
    if (!token) return;
    setDeletingId(id);
    try {
      const r = await fetch(`${API_BASE}/api/v1/daily-routine-exercises/exercise-sets/${id}`, {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} activeItem="exercises" />

      <div className="lg:ml-64 flex flex-col flex-1">
        <Header title="Daily Routine" onToggleSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-6">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
              <Link
                href="/admin/exercises"
                className="px-3 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200"
                aria-label="Back to Exercise Management"
              >
                Back to Management
              </Link>
              <Link
                href="/admin/exercises/daily-routine/create"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                aria-label="Create new daily routine exercise"
              >
                + Create New
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Exercises</h3>
                {loading && <span className="text-sm text-gray-500">Loading…</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((ex, idx) => (
                  <div key={ex.id} className="rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs text-gray-500">Level {idx + 1}</div>
                        <div className="text-sm font-semibold text-gray-900 truncate">{ex.title}</div>
                        <div className="mt-1 text-xs text-gray-600">{ex.sentence_count} sentences</div>
                        <div className="mt-1 text-xs text-gray-500">{new Date(ex.created_at).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/exercises/daily-routine/${ex.id}/edit`}
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
          </div>
        </main>
      </div>
    </div>
  );
}

export default withAdminAuth(DailyRoutinePage);
