'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

const API_NOTIFICATIONS_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '') + '/api/notifications';

function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

type MyNotification = {
  notification_id: string;
  type: 'general' | 'alert' | 'course' | 'system';
  title: string;
  message: string;
  sent_at: string | null;
  created_at: string;
  delivered_at: string;
  read_at: string | null;
  deleted_at?: string | null;
};

function iconForType(t: MyNotification['type']) {
  if (t === 'alert') return { icon: 'fas fa-exclamation-triangle', bg: 'bg-orange-500' };
  if (t === 'course') return { icon: 'fas fa-graduation-cap', bg: 'bg-emerald-500' };
  if (t === 'system') return { icon: 'fas fa-cog', bg: 'bg-purple-600' };
  return { icon: 'fas fa-info-circle', bg: 'bg-blue-600' };
}

function fmtTime(value: string) {
  try {
    const d = new Date(value);
    return d.toLocaleString();
  } catch {
    return value;
  }
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
  if (diff < hour) return `${Math.floor(diff / minute)} min ago`;
  if (diff < day) return `${Math.floor(diff / hour)} hours ago`;
  if (diff < month) {
    const d = Math.floor(diff / day);
    return d === 1 ? '1 day ago' : `${d} days ago`;
  }
  const m = Math.floor(diff / month);
  return m === 1 ? '1 month ago' : `${m} months ago`;
}

export default function Notifications() {
  const token = getAccessToken();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<MyNotification[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [active, setActive] = useState<MyNotification | null>(null);
  const [marking, setMarking] = useState(false);
  const [mounted, setMounted] = useState(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [pageSize, total]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      qs.set('page', String(page));
      qs.set('page_size', String(pageSize));
      const res = await fetch(`${API_NOTIFICATIONS_BASE}/my/?${qs.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error || 'Failed to load notifications');
        setItems([]);
        setTotal(0);
        setUnread(0);
      } else {
        setItems((json.notifications || []) as MyNotification[]);
        setTotal(Number(json.total || 0));
        setUnread(Number(json.unread || 0));
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active]);

  const markRead = async (notificationId: string) => {
    if (!token) return;
    try {
      await fetch(`${API_NOTIFICATIONS_BASE}/my/${encodeURIComponent(notificationId)}/read/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
  };

  const open = async (n: MyNotification) => {
    setActive(n);
    if (!n.read_at) {
      await markRead(n.notification_id);
      setItems((prev) =>
        prev.map((x) => (x.notification_id === n.notification_id ? { ...x, read_at: new Date().toISOString() } : x))
      );
      setUnread((u) => Math.max(0, u - 1));
    }
  };

  const markAllRead = async () => {
    if (!token) return;
    setMarking(true);
    try {
      const res = await fetch(`${API_NOTIFICATIONS_BASE}/my/read-all/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await load();
      }
    } catch {
      setError('Network error');
    } finally {
      setMarking(false);
    }
  };

  const deleteOne = async (notificationId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_NOTIFICATIONS_BASE}/my/${encodeURIComponent(notificationId)}/delete/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        if (active?.notification_id === notificationId) setActive(null);
        await load();
      }
    } catch {
      setError('Network error');
    }
  };

  const modal = active ? (
    <div
      className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm"
      role="presentation"
      onMouseDown={() => setActive(null)}
    >
      <div className="h-full w-full p-4 flex items-center justify-center">
        <div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-2xl max-h-[calc(100vh-2rem)] rounded-3xl shadow-2xl border border-white/30 overflow-hidden bg-white"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-5 bg-gradient-to-br from-blue-50 via-white to-purple-50 border-b border-gray-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white flex-none shadow-sm">
                  <i className="fas fa-bell"></i>
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-gray-200 bg-white">
                      <i className="fas fa-tag"></i>
                      {active.type.toUpperCase()}
                    </span>
                    <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-gray-200 bg-white">
                      <i className="far fa-clock"></i>
                      {fmtTime(active.sent_at || active.created_at)}
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900 mt-3 leading-tight break-words">{active.title}</div>
                </div>
              </div>
              <button
                className="p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-white border border-transparent hover:border-gray-200"
                onClick={() => setActive(null)}
                aria-label="Close"
                type="button"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          <div className="px-6 py-6 overflow-y-auto text-sm text-gray-800 whitespace-pre-wrap">
            {active.message}
          </div>

          <div className="px-6 py-5 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <button
              className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 font-semibold"
              onClick={() => setActive(null)}
              type="button"
            >
              Close
            </button>
            <button
              className="px-4 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 font-semibold"
              onClick={() => deleteOne(active.notification_id)}
              type="button"
            >
              <i className="fas fa-trash mr-2"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Notifications</h2>
          <div className="text-sm text-gray-600 mt-1">
            {loading ? 'Loading…' : total ? `${total.toLocaleString()} total • ${unread.toLocaleString()} unread` : 'No notifications yet'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="px-4 py-2 rounded-xl bg-white/70 border border-white/30 shadow-sm text-gray-800 hover:bg-white disabled:opacity-60"
            disabled={loading || !token}
          >
            <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'} mr-2`}></i>
            Refresh
          </button>
          <button
            onClick={markAllRead}
            className="px-4 py-2 rounded-xl text-white shadow-sm disabled:opacity-60"
            style={{ backgroundColor: 'var(--azul-ultramar)' }}
            disabled={marking || unread === 0 || !token}
          >
            <i className={`fas ${marking ? 'fa-spinner fa-spin' : 'fa-check-double'} mr-2`}></i>
            Mark all read
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold">
          {error}
        </div>
      ) : null}

      <div className="space-y-3">
        {loading ? (
          <div className="p-4 rounded-xl bg-white/60 border border-white/30 text-gray-700">Loading…</div>
        ) : items.length ? (
          items.map((n) => {
            const meta = iconForType(n.type);
            const isUnread = !n.read_at;
            return (
              <div
                key={n.notification_id}
                role="button"
                tabIndex={0}
                onClick={() => open(n)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    open(n);
                  }
                }}
                className={`w-full text-left rounded-2xl border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isUnread
                    ? 'bg-orange-50 border-orange-200 hover:bg-orange-100 focus:ring-orange-300'
                    : 'bg-white/70 border-white/30 hover:bg-white focus:ring-blue-200'
                }`}
              >
                <div className="p-4 sm:p-5 flex items-start gap-4">
                  <div className={`h-11 w-11 rounded-2xl flex items-center justify-center text-white ${meta.bg}`}>
                    <i className={meta.icon}></i>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-base font-semibold text-gray-900 truncate">{n.title}</div>
                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">{n.message}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-none">
                        <div className="flex items-center gap-2">
                          {isUnread ? <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> : <span className="h-2.5 w-2.5 rounded-full bg-transparent" />}
                          <button
                            type="button"
                            className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-xs font-semibold"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteOne(n.notification_id);
                            }}
                          >
                            <i className="fas fa-trash mr-2"></i>
                            Delete
                          </button>
                        </div>
                        <div className="text-xs text-gray-500">{relativeTime(n.sent_at || n.created_at)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 rounded-2xl bg-white/60 border border-white/30 text-gray-700">
            No notifications yet.
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          className="px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-60"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>
        <div className="text-sm text-gray-600">
          Page {page} / {totalPages}
        </div>
        <button
          type="button"
          className="px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-60"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>

      {mounted && modal ? createPortal(modal, document.body) : null}
    </div>
  );
}
