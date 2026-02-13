'use client';

import { useEffect, useState } from 'react';

const API_LESSONS_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '') + '/api/lessons';

function useAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

export default function LessonStatsCards() {
  const [stats, setStats] = useState<{ total_lessons: number; blocks_count: number; parts_count: number; listening_lessons: number } | null>(null);
  const token = useAccessToken();

  const loadStats = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_LESSONS_BASE}/stats/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setStats({
          total_lessons: data.total_lessons || 0,
          blocks_count: data.blocks_count || 0,
          parts_count: data.parts_count || 0,
          listening_lessons: data.listening_lessons || 0,
        });
      }
    } catch {}
  };

  useEffect(() => {
    loadStats();
  }, [token]);

  useEffect(() => {
    const handler = () => loadStats();
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
  }, [token]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-book text-2xl text-blue-600"></i>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Lessons</dt>
                <dd className="text-lg font-medium text-gray-900">{stats ? stats.total_lessons : '-'}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-layer-group text-2xl text-yellow-500"></i>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Distinct Blocks</dt>
                <dd className="text-lg font-medium text-gray-900">{stats ? stats.blocks_count : '-'}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-file-alt text-2xl text-orange-500"></i>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Parts</dt>
                <dd className="text-lg font-medium text-gray-900">{stats ? stats.parts_count : '-'}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-headphones text-2xl text-green-400"></i>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Listening Lessons</dt>
                <dd className="text-lg font-medium text-gray-900">{stats ? stats.listening_lessons : '-'}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
