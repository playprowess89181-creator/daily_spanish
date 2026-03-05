'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Link from 'next/link';
import { withAdminAuth } from '../../../lib/AuthContext';

const API_SUPPORT_BASE = process.env.NEXT_PUBLIC_API_BASE_URL + '/api/support';

type Thread = {
  id: string;
  title: string;
  status: 'open' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  user_id: string;
  user_name: string;
  user_email: string;
};

function useAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

function SupportThreadsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useAccessToken();

  useEffect(() => {
    const fetchThreads = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_SUPPORT_BASE}/threads/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setThreads(data.threads || []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchThreads();
  }, [token]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} activeItem="support" />
      <div className="lg:ml-64 flex flex-col flex-1">
        <Header title="Support" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="p-6">Loading...</div>
            ) : (
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="font-semibold">Support Threads</h2>
                </div>
                <div className="divide-y">
                  {threads.map(t => (
                    <Link key={t.id} href={`/admin/support/${t.id}`} className="flex items-center justify-between p-4 hover:bg-neutral-50">
                      <div className="flex flex-col">
                        <span className="font-medium">{t.title}</span>
                        <span className="text-sm text-neutral-600">{t.user_name} · {t.user_email}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-xs px-2 py-1 rounded ${t.status === 'open' ? 'bg-blue-600 text-white' : t.status === 'resolved' ? 'bg-green-600 text-white' : 'bg-neutral-300 text-neutral-900'}`}>{t.status}</span>
                        <i className="fas fa-chevron-right text-neutral-500"></i>
                      </div>
                    </Link>
                  ))}
                  {threads.length === 0 && (
                    <div className="p-6 text-neutral-600">No threads</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default withAdminAuth(SupportThreadsPage);
