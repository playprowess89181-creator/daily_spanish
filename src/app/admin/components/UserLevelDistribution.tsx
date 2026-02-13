'use client';

import { useEffect, useState } from 'react';

const API_AUTH_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '') + '/api/auth';

function useAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

export default function UserLevelDistribution() {
  const token = useAccessToken();
  const [counts, setCounts] = useState<Record<string, number>>({ A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 });

  const colors: Record<string, { bg: string; text: string; label: string }> = {
    A1: { bg: 'var(--azul-ultramar)', text: '#ffffff', label: 'Beginner' },
    A2: { bg: 'var(--amarillo-ocre)', text: '#ffffff', label: 'Elementary' },
    B1: { bg: 'var(--naranja)', text: '#ffffff', label: 'Intermediate' },
    B2: { bg: 'var(--verde-menta)', text: '#1f2937', label: 'Upper-Int.' },
    C1: { bg: 'var(--rosa-palo)', text: '#1f2937', label: 'Advanced' },
  };

  const load = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_AUTH_BASE}/users/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return;
      const list = Array.isArray(data.users) ? data.users : [];
      const next: Record<string, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 };
      for (const u of list) {
        const lv = (u.level || '').toUpperCase();
        if (lv in next) next[lv] += 1;
      }
      setCounts(next);
    } catch {}
  };

  useEffect(() => { load(); }, [token]);
  useEffect(() => {
    const handler = () => load();
    if (typeof window !== 'undefined') window.addEventListener('users:changed', handler);
    return () => { if (typeof window !== 'undefined') window.removeEventListener('users:changed', handler); };
  }, [token]);

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">User Level Distribution</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {(['A1', 'A2', 'B1', 'B2', 'C1'] as const).map((code) => (
          <div key={code} className="text-center">
            <div className="rounded-lg p-4 mb-2" style={{ backgroundColor: colors[code].bg, color: colors[code].text }}>
              <div className="text-2xl font-bold">{counts[code].toLocaleString()}</div>
              <div className="text-sm opacity-90">{colors[code].label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
