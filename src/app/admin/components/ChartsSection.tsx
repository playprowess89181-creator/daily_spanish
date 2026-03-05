'use client';

import { useEffect, useState } from 'react';

const API_AUTH_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '') + '/api/auth';

function useAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

interface ProgressBarProps {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

function ProgressBar({ label, value, percentage, color }: ProgressBarProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center space-x-2">
        <div className="w-24 bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full" 
            style={{ width: `${percentage}%`, backgroundColor: color }}
          ></div>
        </div>
        <span className="text-sm font-medium">{value.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function ChartsSection() {
  const token = useAccessToken();
  const [countries, setCountries] = useState<Array<{ label: string; value: number; percentage: number; color: string }>>([]);
  const [languages, setLanguages] = useState<Array<{ label: string; value: number; percentage: number; color: string }>>([]);

  const palette = ['var(--azul-ultramar)', 'var(--amarillo-ocre)', 'var(--naranja)', 'var(--verde-menta)', 'var(--rosa-palo)'];

  const loadUsers = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_AUTH_BASE}/users/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return;
      const list = Array.isArray(data.users) ? data.users : [];
      const total = list.length || 1;
      const byCountry: Record<string, number> = {};
      const byLang: Record<string, number> = {};
      for (const u of list) {
        const c = (u.country || 'Unknown').trim();
        const l = (u.native_language || 'Unknown').trim();
        byCountry[c] = (byCountry[c] || 0) + 1;
        byLang[l] = (byLang[l] || 0) + 1;
      }
      const countryRows = Object.entries(byCountry)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map((entry, i) => ({ label: entry[0], value: entry[1], percentage: Math.round((entry[1] / total) * 100), color: palette[i % palette.length] }));
      const langRows = Object.entries(byLang)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map((entry, i) => ({ label: entry[0], value: entry[1], percentage: Math.round((entry[1] / total) * 100), color: palette[i % palette.length] }));
      setCountries(countryRows);
      setLanguages(langRows);
    } catch {}
  };

  useEffect(() => {
    loadUsers();
  }, [token]);

  useEffect(() => {
    const handler = () => loadUsers();
    if (typeof window !== 'undefined') {
      window.addEventListener('users:changed', handler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('users:changed', handler);
      }
    };
  }, [token]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Users by Country</h3>
        <div className="space-y-3">
          {countries.map((item, index) => (
            <ProgressBar key={index} label={item.label} value={item.value} percentage={item.percentage} color={item.color} />
          ))}
          {countries.length === 0 && <div className="text-sm text-gray-600">No data</div>}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Language Distribution</h3>
        <div className="space-y-3">
          {languages.map((item, index) => (
            <ProgressBar key={index} label={item.label} value={item.value} percentage={item.percentage} color={item.color} />
          ))}
          {languages.length === 0 && <div className="text-sm text-gray-600">No data</div>}
        </div>
      </div>
    </div>
  );
}
