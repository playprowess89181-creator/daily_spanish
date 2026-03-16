'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { withAdminAuth } from '../../../lib/AuthContext';

const API_NOTIFICATIONS_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '') + '/api/notifications';

function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

function relativeTime(value: string) {
  const now = Date.now();
  const t = new Date(value).getTime();
  if (!Number.isFinite(t)) return value;
  const diff = Math.max(0, now - t);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;

  if (diff < minute) return 'just now';
  if (diff < hour) return `${Math.floor(diff / minute)} minutes ago`;
  if (diff < day) return `${Math.floor(diff / hour)} hours ago`;
  if (diff < month) {
    const d = Math.floor(diff / day);
    return d === 1 ? '1 day ago' : `${d} days ago`;
  }
  const m = Math.floor(diff / month);
  return m === 1 ? '1 month ago' : `${m} months ago`;
}

type NotificationType = 'general' | 'alert' | 'course' | 'system';

type AudienceFilters = {
  query?: string;
  countries?: string[];
  native_languages?: string[];
  levels?: string[];
  genders?: string[];
  age_min?: string;
  age_max?: string;
  joined_from?: string;
  joined_to?: string;
};

type ApiNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  audience_filters: any;
  created_at: string;
  sent_at: string | null;
  recipients_count: number;
  read_count: number;
};

function NotificationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = getAccessToken();

  const [type, setType] = useState<NotificationType>('general');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState<AudienceFilters>({});

  const [filterOptions, setFilterOptions] = useState<{ countries: string[]; languages: string[]; levels: string[]; genders: string[] } | null>(null);

  const [audiencePreview, setAudiencePreview] = useState<{ total: number } | null>(null);
  const [audienceLoading, setAudienceLoading] = useState(false);

  const [notifPage, setNotifPage] = useState(1);
  const [notifTotal, setNotifTotal] = useState(0);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const notifPageSize = 10;
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const typeOptions = useMemo(
    () => [
      { id: 'general' as const, label: 'General', icon: 'fas fa-info-circle', accent: 'from-blue-600 to-indigo-600' },
      { id: 'alert' as const, label: 'Alert', icon: 'fas fa-exclamation-triangle', accent: 'from-orange-500 to-rose-500' },
      { id: 'course' as const, label: 'Course', icon: 'fas fa-graduation-cap', accent: 'from-emerald-500 to-teal-600' },
      { id: 'system' as const, label: 'System', icon: 'fas fa-cog', accent: 'from-purple-600 to-fuchsia-600' },
    ],
    []
  );

  const loadAudiencePreview = useCallback(async () => {
    if (!token) return;
    setAudienceLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('filters', JSON.stringify(filters || {}));
      const res = await fetch(`${API_NOTIFICATIONS_BASE}/admin/audience/preview/?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAudiencePreview(null);
      } else {
        setAudiencePreview(json as any);
      }
    } catch {
      setAudiencePreview(null);
    } finally {
      setAudienceLoading(false);
    }
  }, [filters, token]);

  const loadFilterOptions = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_NOTIFICATIONS_BASE}/admin/options/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFilterOptions(null);
      } else {
        setFilterOptions(json as any);
      }
    } catch {
      setFilterOptions(null);
    }
  }, [token]);

  const loadNotifications = useCallback(async () => {
    if (!token) return;
    setNotificationsLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set('page', String(notifPage));
      qs.set('page_size', String(notifPageSize));
      const res = await fetch(`${API_NOTIFICATIONS_BASE}/admin/notifications/?${qs.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotifications([]);
        setNotifTotal(0);
      } else {
        setNotifications((json.notifications || []) as ApiNotification[]);
        setNotifTotal(Number(json.total || 0));
      }
    } catch {
      setNotifications([]);
      setNotifTotal(0);
    } finally {
      setNotificationsLoading(false);
    }
  }, [notifPage, token]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadAudiencePreview();
    }, 250);
    return () => clearTimeout(t);
  }, [loadAudiencePreview]);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  const submit = async () => {
    if (!token) return;
    setToast(null);
    const t = title.trim();
    const m = message.trim();
    if (!t || !m) {
      setToast({ type: 'error', text: 'Title and message are required.' });
      return;
    }

    try {
      const res = await fetch(`${API_NOTIFICATIONS_BASE}/admin/notifications/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: t,
          message: m,
          filters: filters || {},
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToast({ type: 'error', text: json?.error || 'Failed to create notification.' });
        return;
      }
      setToast({
        type: 'success',
        text: 'Notification sent.',
      });
      setTitle('');
      setMessage('');
      setNotifPage(1);
      await loadNotifications();
    } catch {
      setToast({ type: 'error', text: 'Network error.' });
    }
  };

  const deleteNotification = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_NOTIFICATIONS_BASE}/admin/notifications/${encodeURIComponent(id)}/delete/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await loadNotifications();
      }
    } catch {}
  };

  const notifTotalPages = Math.max(1, Math.ceil(notifTotal / notifPageSize));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          activeItem="notifications"
        />
      
      <div className="lg:ml-64 flex flex-col flex-1">
        <Header 
          title="Notifications"
          onToggleSidebar={() => setSidebarOpen(true)}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-6">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
              <div>
                <div className="text-sm text-gray-600">Admin / Notifications</div>
                <div className="text-xl font-semibold text-gray-900">Send and manage in-app notifications</div>
                <div className="text-sm text-gray-600 mt-1">
                  {audienceLoading ? 'Calculating audience…' : audiencePreview ? `${audiencePreview.total.toLocaleString()} recipients` : 'Audience preview unavailable'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-4 py-2 rounded-xl bg-white/70 border border-white/30 shadow-sm text-gray-800 hover:bg-white"
                  onClick={() => {
                    setNotifPage(1);
                    loadNotifications();
                  }}
                  disabled={notificationsLoading || !token}
                >
                  <i className={`fas ${notificationsLoading ? 'fa-spinner fa-spin' : 'fa-sync-alt'} mr-2`}></i>
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              <div className="lg:col-span-7 glass-effect rounded-2xl border border-white/20 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Create Notification</h3>
                  <div className="text-xs text-gray-500">In-app</div>
                </div>

                <div className="mb-5">
                  <div className="text-sm font-medium text-gray-700 mb-2">Notification Type</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {typeOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setType(opt.id)}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          type === opt.id ? 'border-blue-200 bg-white shadow-sm' : 'border-gray-200 bg-white/70 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${opt.accent} flex items-center justify-center`}>
                            <i className={`${opt.icon} text-white`}></i>
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">{opt.label}</div>
                            <div className="text-xs text-gray-500">{opt.id}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                      placeholder="Enter a short title"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                      placeholder="Write the full notification message"
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={submit}
                    className="px-4 py-2 rounded-xl text-white shadow-sm disabled:opacity-60"
                    style={{ backgroundColor: 'var(--azul-ultramar)' }}
                    disabled={!token}
                  >
                    <i className="fas fa-check mr-2"></i>
                    Send notification
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="glass-effect rounded-2xl border border-white/20 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Target Audience</h3>
                    <div className="text-xs text-gray-500">Filtered</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-gray-200 bg-white/60 p-4">
                          <div className="text-sm font-semibold text-gray-900 mb-2">Country</div>
                          <select
                            value={filters.countries?.[0] || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFilters((p) => ({
                                ...p,
                                countries: value ? [value] : [],
                              }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                          >
                            <option value="">All</option>
                            {(filterOptions?.countries || []).map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white/60 p-4">
                          <div className="text-sm font-semibold text-gray-900 mb-2">Language</div>
                          <select
                            value={filters.native_languages?.[0] || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFilters((p) => ({
                                ...p,
                                native_languages: value ? [value] : [],
                              }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                          >
                            <option value="">All</option>
                            {(filterOptions?.languages || []).map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white/60 p-4">
                          <div className="text-sm font-semibold text-gray-900 mb-2">Level</div>
                          <select
                            value={filters.levels?.[0] || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFilters((p) => ({
                                ...p,
                                levels: value ? [value] : [],
                              }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                          >
                            <option value="">All</option>
                            {(filterOptions?.levels || []).map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white/60 p-4">
                          <div className="text-sm font-semibold text-gray-900 mb-2">Gender</div>
                          <select
                            value={filters.genders?.[0] || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFilters((p) => ({
                                ...p,
                                genders: value ? [value] : [],
                              }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                          >
                            <option value="">All</option>
                            {(filterOptions?.genders || []).map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white/60 p-4">
                      <div className="text-sm font-semibold text-gray-900 mb-2">Age</div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={filters.age_min || ''}
                          onChange={(e) => setFilters((p) => ({ ...p, age_min: e.target.value }))}
                          type="number"
                          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                          placeholder="Min"
                        />
                        <input
                          value={filters.age_max || ''}
                          onChange={(e) => setFilters((p) => ({ ...p, age_max: e.target.value }))}
                          type="number"
                          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                          placeholder="Max"
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white/60 p-4">
                      <div className="text-sm font-semibold text-gray-900 mb-2">Joined</div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={filters.joined_from || ''}
                          onChange={(e) => setFilters((p) => ({ ...p, joined_from: e.target.value }))}
                          type="date"
                          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                        />
                        <input
                          value={filters.joined_to || ''}
                          onChange={(e) => setFilters((p) => ({ ...p, joined_to: e.target.value }))}
                          type="date"
                          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">Estimated recipients</div>
                      <div className="text-xl font-extrabold text-gray-900">{audiencePreview ? audiencePreview.total.toLocaleString() : '—'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-effect rounded-2xl border border-white/20 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
                <div className="text-sm text-gray-600">
                  {notifTotal ? `${notifTotal.toLocaleString()} total` : notificationsLoading ? 'Loading…' : '—'}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[980px] divide-y divide-gray-200">
                  <thead className="bg-white/60">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Recipients</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Read</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Sent</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/60 divide-y divide-gray-100">
                    {notificationsLoading ? (
                      <tr>
                        <td className="px-4 py-4 text-sm text-gray-600" colSpan={6}>
                          Loading…
                        </td>
                      </tr>
                    ) : notifications.length ? (
                      notifications.map((n) => (
                        <tr key={n.id} className="hover:bg-white/80">
                          <td className="px-4 py-3">
                            <div className="text-sm font-semibold text-gray-900">{n.title}</div>
                            <div className="text-xs text-gray-600 line-clamp-1">{n.message}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{n.type}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right whitespace-nowrap">{n.recipients_count.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right whitespace-nowrap">
                            {n.read_count.toLocaleString()}
                            {n.recipients_count ? (
                              <span className="text-xs text-gray-500 ml-2">{`${Math.round((n.read_count / n.recipients_count) * 100)}%`}</span>
                            ) : null}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right whitespace-nowrap">
                            {relativeTime(n.sent_at || n.created_at)}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              className="px-3 py-1.5 rounded-md border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold"
                              onClick={() => deleteNotification(n.id)}
                            >
                              <i className="fas fa-trash mr-2"></i>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-4 py-4 text-sm text-gray-600" colSpan={6}>
                          No notifications yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  className="px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-60"
                  disabled={notifPage <= 1}
                  onClick={() => setNotifPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>
                <div className="text-sm text-gray-600">
                  Page {notifPage} / {notifTotalPages}
                </div>
                <button
                  type="button"
                  className="px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-60"
                  disabled={notifPage >= notifTotalPages}
                  onClick={() => setNotifPage((p) => Math.min(notifTotalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default withAdminAuth(NotificationsPage);
