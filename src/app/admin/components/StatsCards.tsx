'use client';

import { useEffect, useState } from 'react';

const API_AUTH_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '') + '/api/auth';

function useAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

export default function StatsCards() {
  const [stats, setStats] = useState<{ total_users: number; active_users: number; active_payments: number; overdue_payments: number } | null>(null);
  const token = useAccessToken();

  const loadStats = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_AUTH_BASE}/dashboard/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setStats({
          total_users: data.total_users || 0,
          active_users: data.active_users || 0,
          active_payments: data.active_payments || 0,
          overdue_payments: data.overdue_payments || 0,
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
      window.addEventListener('lessons:changed', handler);
      window.addEventListener('users:changed', handler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('lessons:changed', handler);
        window.removeEventListener('users:changed', handler);
      }
    };
  }, [token]);

  const items = [
    { title: 'Total Users', value: stats ? stats.total_users.toLocaleString() : '-', icon: 'fas fa-users', iconColor: 'var(--azul-ultramar)' },
    { title: 'Active Users', value: stats ? stats.active_users.toLocaleString() : '-', icon: 'fas fa-user-check', iconColor: 'var(--verde-menta)' },
    { title: 'Active Payments', value: stats ? stats.active_payments.toLocaleString() : '-', icon: 'fas fa-credit-card', iconColor: 'var(--naranja)' },
    { title: 'Overdue Payments', value: stats ? stats.overdue_payments.toLocaleString() : '-', icon: 'fas fa-exclamation-triangle', iconColor: '#ef4444' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {items.map((stat, index) => (
        <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className={`${stat.icon} text-2xl`} style={{ color: stat.iconColor }}></i>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                  <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
