'use client';

import { useEffect, useState } from 'react';

type Item = {
  id: number;
  type: string;
  question: string;
  options: string[];
  answer: string;
  vocabulary_word?: string;
};

export default function VocabularyExercisesList() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

  function useAccessToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  }

  const token = useAccessToken();

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE}/api/v1/vocabulary-exercises`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(async (r) => {
      if (!r.ok) return;
      const data = await r.json();
      setItems(Array.isArray(data) ? data : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [token, API_BASE]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Exercises</h3>
        {loading && <span className="text-sm text-gray-500">Loading…</span>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((exercise) => (
          <div key={exercise.id} className="rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-gray-500">{exercise.type}</div>
                <div className="text-sm font-semibold text-gray-900 mt-1">{exercise.question}</div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">{exercise.vocabulary_word || '—'}</span>
            </div>
            <div className="mt-3 text-xs text-gray-600">Options: {exercise.options?.join(', ')}</div>
            <div className="mt-1 text-xs text-gray-600">Answer: <span className="text-green-600 font-medium">{exercise.answer}</span></div>
          </div>
        ))}
        {items.length === 0 && !loading && (
          <div className="text-sm text-gray-600">No exercises found.</div>
        )}
      </div>
    </div>
  );
}
