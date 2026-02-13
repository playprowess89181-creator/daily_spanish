'use client';

import { useEffect, useState } from 'react';

type Stats = {
  totalWords: number;
  totalExercises: number;
  pendingUploads: number;
  errors: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

function useAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

export default function VocabularyStatsCards() {
  const [stats, setStats] = useState<Stats>({ totalWords: 0, totalExercises: 0, pendingUploads: 0, errors: 0 });
  const token = useAccessToken();

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/v1/vocabulary-exercises/stats`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(async (r) => {
        if (!r.ok) return;
        const data = await r.json();
        setStats({
          totalWords: data.total_words ?? 0,
          totalExercises: data.total_exercises ?? 0,
          pendingUploads: data.pending_uploads ?? 0,
          errors: data.errors ?? 0,
        });
      })
      .catch(() => {});
  }, [token]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-sm ring-1 ring-black/5">
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500" />
        <div className="p-6 flex items-center">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 text-white flex items-center justify-center shadow-md">
            <i className="fas fa-book text-lg"></i>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Words</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalWords}</p>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-sm ring-1 ring-black/5">
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-400 via-indigo-500 to-violet-600" />
        <div className="p-6 flex items-center">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <i className="fas fa-tasks text-lg"></i>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Exercises</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalExercises}</p>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-sm ring-1 ring-black/5">
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600" />
        <div className="p-6 flex items-center">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-md">
            <i className="fas fa-file-upload text-lg"></i>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Pending Uploads</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingUploads}</p>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-sm ring-1 ring-black/5">
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-red-400 via-rose-500 to-pink-600" />
        <div className="p-6 flex items-center">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md">
            <i className="fas fa-exclamation-triangle text-lg"></i>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Errors</p>
            <p className="text-2xl font-bold text-gray-900">{stats.errors}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

