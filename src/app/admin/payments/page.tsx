'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import PaymentStatsCards from './components/PaymentStatsCards';
import PaymentFilters from './components/PaymentFilters';
import PaymentTabs from './components/PaymentTabs';
import RevenueCharts from './components/RevenueCharts';
import BulkActions from './components/BulkActions';
import { withAdminAuth } from '../../../lib/AuthContext';

const API_AUTH_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '') + '/api/auth';

function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

type PaymentsOverview = {
  generated_at: string;
  stats: {
    estimated_total_revenue_cents: number;
    estimated_mrr_cents: number;
    active_subscriptions: number;
    overdue_payments: number;
    subscribers_total: number;
  };
  plan_breakdown: { monthly: number; yearly: number };
  users: Array<{
    id: string;
    name: string | null;
    email: string;
    plan_key: 'monthly' | 'yearly' | null;
    plan_label: string | null;
    amount_cents: number;
    currency: string;
    status: 'none' | 'active' | 'overdue';
    started_at: string | null;
    next_due: string | null;
    date_joined: string | null;
  }>;
  subscriptions: Array<{
    user_id: string;
    user_name: string | null;
    user_email: string;
    plan_label: string;
    amount_cents: number;
    currency: string;
    start_date: string | null;
    next_payment: string | null;
    status: string;
  }>;
  overdue: Array<{
    user_id: string;
    user_name: string | null;
    email: string;
    plan_label: string;
    amount_cents: number;
    currency: string;
    due_date: string | null;
    days_past_due: number;
  }>;
};

function PaymentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'overdue' | 'subscriptions'>('overdue');
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    planType: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const token = getAccessToken();
  const [overview, setOverview] = useState<PaymentsOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'all' || tab === 'overdue' || tab === 'subscriptions') setActiveTab(tab);
  };

  const loadOverview = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setToast(null);
    try {
      const res = await fetch(`${API_AUTH_BASE}/admin/payments/overview/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await res.json().catch(() => ({}))) as any;
      if (!res.ok) {
        setOverview(null);
        setToast({ type: 'error', text: json?.error || 'Failed to load payments overview.' });
      } else {
        setOverview(json as PaymentsOverview);
      }
    } catch {
      setOverview(null);
      setToast({ type: 'error', text: 'Network error while loading payments overview.' });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const filteredUsers = useMemo(() => {
    const list = overview?.users || [];
    const q = filters.search.trim().toLowerCase();
    const planType = (filters.planType || 'all').toLowerCase();
    const statusFilter = (filters.status || 'all').toLowerCase();
    const from = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const to = filters.dateTo ? new Date(filters.dateTo) : null;

    return list.filter((u) => {
      if (q) {
        const hay = `${u.name || ''} ${u.email || ''} ${u.id || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (planType !== 'all') {
        if ((u.plan_key || '').toLowerCase() !== planType) return false;
      }
      if (statusFilter !== 'all') {
        if (statusFilter === 'active' && u.status !== 'active') return false;
        if (statusFilter === 'overdue' && u.status !== 'overdue') return false;
        if (statusFilter === 'cancelled' && u.status !== 'none') return false;
      }
      if ((from || to) && u.date_joined) {
        const dj = new Date(u.date_joined);
        if (from && dj < from) return false;
        if (to) {
          const toEnd = new Date(to);
          toEnd.setHours(23, 59, 59, 999);
          if (dj > toEnd) return false;
        }
      }
      return true;
    });
  }, [filters.dateFrom, filters.dateTo, filters.planType, filters.search, filters.status, overview?.users]);

  const filteredOverdue = useMemo(() => {
    const list = overview?.overdue || [];
    const q = filters.search.trim().toLowerCase();
    const planType = (filters.planType || 'all').toLowerCase();
    return list.filter((o) => {
      if (q) {
        const hay = `${o.user_name || ''} ${o.email || ''} ${o.user_id || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (planType !== 'all') {
        if ((o.plan_label || '').toLowerCase() !== (planType === 'yearly' ? 'annual' : 'monthly')) return false;
      }
      return true;
    });
  }, [filters.planType, filters.search, overview?.overdue]);

  const filteredSubscriptions = useMemo(() => {
    const list = overview?.subscriptions || [];
    const q = filters.search.trim().toLowerCase();
    const planType = (filters.planType || 'all').toLowerCase();
    return list.filter((s) => {
      if (q) {
        const hay = `${s.user_name || ''} ${s.user_email || ''} ${s.user_id || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (planType !== 'all') {
        if ((s.plan_label || '').toLowerCase() !== (planType === 'yearly' ? 'annual' : 'monthly')) return false;
      }
      return true;
    });
  }, [filters.planType, filters.search, overview?.subscriptions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <Sidebar isOpen={sidebarOpen} onToggle={handleToggleSidebar} activeItem="payments" />
      
      <div className="lg:ml-64 flex flex-col flex-1">
        <Header 
          title="Payments & Subscriptions"
          onToggleSidebar={handleToggleSidebar} 
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-6">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
              <div>
                <div className="text-sm text-gray-600">Admin / Payments & Subscriptions</div>
                <div className="text-xl font-semibold text-gray-900">Track subscriptions, overdue accounts, and downloads</div>
                <div className="text-sm text-gray-600 mt-1">
                  {loading ? 'Loading…' : overview ? `Updated ${new Date(overview.generated_at).toLocaleString()}` : 'Overview unavailable'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-4 py-2 rounded-xl bg-white/70 border border-white/30 shadow-sm text-gray-800 hover:bg-white disabled:opacity-60"
                  onClick={() => loadOverview()}
                  disabled={loading || !token}
                >
                  <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'} mr-2`}></i>
                  Refresh
                </button>
              </div>
            </div>

            {toast && (
              <div
                className={`mb-6 p-4 rounded-xl border text-sm font-semibold ${
                  toast.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {toast.text}
              </div>
            )}

            <PaymentStatsCards stats={overview?.stats || null} loading={loading} />

            <div className="glass-effect rounded-2xl border border-white/20 shadow-sm mb-8">
              <PaymentFilters filters={filters} onFilterChange={handleFilterChange} />
            </div>

            <PaymentTabs 
              activeTab={activeTab} 
              onTabChange={handleTabChange} 
              filters={filters} 
              users={filteredUsers}
              subscriptions={filteredSubscriptions}
              overdue={filteredOverdue}
              loading={loading}
              token={token}
              onToast={setToast}
              onRefresh={loadOverview}
            />
            
            <RevenueCharts planBreakdown={overview?.plan_breakdown || null} stats={overview?.stats || null} loading={loading} />
            
            <BulkActions
              token={token}
              overdueCount={overview?.stats?.overdue_payments || 0}
              onToast={setToast}
              onComplete={() => loadOverview()}
            />

          </div>
        </main>
      </div>
    </div>
  );
}

export default withAdminAuth(PaymentsPage);
