'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { withAdminAuth } from '../../../lib/AuthContext';
import ReportStatsCards from './components/ReportStatsCards';
import ReportsCharts from './components/ReportsCharts';
import PaymentTrendsChart from './components/PaymentTrendsChart';
import ReportsTables from './components/ReportsTables';

const API_AUTH_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '') + '/api/auth';

function useAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

export type ReportsAnalytics = {
  generated_at: string;
  window_days: number;
  users: {
    total: number;
    active: number;
    blocked: number;
    verified: number;
    subscribed: number;
    countries_count: number;
    languages_count: number;
    by_country: Array<{ key: string; label: string; count: number }>;
    by_language: Array<{ key: string; label: string; count: number }>;
    by_level: Array<{ key: string; label: string; count: number }>;
    signups: Array<{ date: string; count: number }>;
  };
  lessons: {
    total: number;
    by_block: Record<'A1' | 'A2' | 'B1' | 'B2' | 'C1', number>;
    with_video_file: number;
    with_video_url: number;
    with_lesson_pdf: number;
    with_keys_pdf: number;
  };
  support: {
    total: number;
    open: number;
    resolved: number;
    closed: number;
  };
  recent_users: Array<{
    id: string;
    email: string;
    name: string | null;
    country: string | null;
    native_language: string | null;
    level: string | null;
    is_active: boolean;
    is_blocked: boolean;
    date_joined: string;
    last_login: string | null;
  }>;
};

function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = useAccessToken();
  const [days, setDays] = useState(30);
  const [data, setData] = useState<ReportsAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_AUTH_BASE}/reports/?days=${encodeURIComponent(String(days))}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error || 'Failed to load reports');
        setData(null);
      } else {
        setData(json as ReportsAnalytics);
      }
    } catch {
      setError('Network error');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [days, token]);

  useEffect(() => {
    reload();
  }, [reload]);

  const generatedAt = useMemo(() => {
    if (!data?.generated_at) return '';
    try {
      return new Date(data.generated_at).toLocaleString();
    } catch {
      return String(data.generated_at);
    }
  }, [data?.generated_at]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} activeItem="reports" />
      
      <div className="lg:ml-64 flex flex-col flex-1">
        <Header 
          title="Reports & Analytics" 
          onToggleSidebar={() => setSidebarOpen(true)} 
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-6">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <div className="text-sm text-gray-600">Admin / Reports</div>
                <div className="text-xl font-semibold text-gray-900">Analytics Overview</div>
                {generatedAt ? <div className="text-xs text-gray-500 mt-1">Updated {generatedAt}</div> : null}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 border border-white/30 shadow-sm">
                  <i className="fas fa-calendar-alt text-gray-500"></i>
                  <select
                    className="bg-transparent text-sm font-semibold text-gray-900 outline-none"
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                  >
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                    <option value={365}>Last 365 days</option>
                  </select>
                </div>
                <button
                  onClick={reload}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white shadow-sm disabled:opacity-60"
                  style={{ backgroundColor: 'var(--azul-ultramar)' }}
                  disabled={loading || !token}
                >
                  <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
                  Refresh
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold">
                {error}
              </div>
            )}

            <ReportStatsCards data={data} loading={loading} />
            <ReportsCharts data={data} loading={loading} />
            <PaymentTrendsChart data={data} loading={loading} />
            <ReportsTables data={data} loading={loading} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default withAdminAuth(ReportsPage);
