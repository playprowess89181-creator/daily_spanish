'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import ConfirmDialog from '../../components/ConfirmDialog';

interface PaymentTabsProps {
  activeTab: 'all' | 'overdue' | 'subscriptions';
  onTabChange: (tab: string) => void;
  filters: any;
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
  loading: boolean;
  token: string | null;
  onToast: (t: { type: 'success' | 'error'; text: string } | null) => void;
  onRefresh: () => void;
}

function formatUSD(cents: number) {
  const v = Number(cents || 0) / 100;
  return v.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}

const API_AUTH_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '') + '/api/auth';

function parseFilenameFromDisposition(value: string | null) {
  if (!value) return null;
  const m = /filename="?([^"]+)"?/i.exec(value);
  return m?.[1] || null;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  const className =
    key === 'active'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : key === 'overdue'
        ? 'border-red-200 bg-red-50 text-red-700'
        : 'border-gray-200 bg-gray-50 text-gray-700';
  const label = status === 'none' ? 'None' : status[0].toUpperCase() + status.slice(1);
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${className}`}>{label}</span>;
}

export default function PaymentTabs({ activeTab, onTabChange, users, subscriptions, overdue, loading, token, onToast, onRefresh }: PaymentTabsProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const selectedUser = useMemo(() => users.find((u) => u.id === selectedUserId) || null, [selectedUserId, users]);

  const [busy, setBusy] = useState<{ kind: 'invoice' | 'reminder' | 'extend'; userId: string } | null>(null);
  const [extendOpen, setExtendOpen] = useState(false);
  const [extendUserId, setExtendUserId] = useState<string | null>(null);
  const [extendDate, setExtendDate] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const open = Boolean(selectedUserId) || extendOpen;
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [extendOpen, selectedUserId]);

  const isBusy = (kind: 'invoice' | 'reminder' | 'extend', userId: string) => busy?.kind === kind && busy?.userId === userId;

  const downloadInvoice = async (userId: string) => {
    if (!token) return;
    if (busy) return;
    onToast(null);
    setBusy({ kind: 'invoice', userId });
    try {
      const res = await fetch(`${API_AUTH_BASE}/admin/payments/users/${encodeURIComponent(userId)}/invoice/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        onToast({ type: 'error', text: json?.error || 'Failed to download invoice.' });
        return;
      }
      const blob = await res.blob();
      const filename = parseFilenameFromDisposition(res.headers.get('content-disposition')) || 'invoice.pdf';
      triggerDownload(blob, filename);
      onToast({ type: 'success', text: 'Invoice download started.' });
    } catch {
      onToast({ type: 'error', text: 'Network error while downloading invoice.' });
    } finally {
      setBusy(null);
    }
  };

  const sendReminder = async (userId: string) => {
    if (!token) return;
    if (busy) return;
    onToast(null);
    setBusy({ kind: 'reminder', userId });
    try {
      const res = await fetch(`${API_AUTH_BASE}/admin/payments/users/${encodeURIComponent(userId)}/send-reminder/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        onToast({ type: 'error', text: json?.error || 'Failed to send reminder.' });
        return;
      }
      onToast({ type: 'success', text: 'Reminder sent.' });
    } catch {
      onToast({ type: 'error', text: 'Network error while sending reminder.' });
    } finally {
      setBusy(null);
    }
  };

  const openExtend = (userId: string) => {
    const today = new Date();
    const next = new Date(today);
    next.setDate(today.getDate() + 7);
    setExtendDate(next.toISOString().slice(0, 10));
    setExtendUserId(userId);
    setExtendOpen(true);
  };

  const submitExtend = async () => {
    if (!token || !extendUserId) return;
    if (!extendDate) return;
    if (busy) return;
    onToast(null);
    setBusy({ kind: 'extend', userId: extendUserId });
    try {
      const res = await fetch(`${API_AUTH_BASE}/admin/payments/users/${encodeURIComponent(extendUserId)}/extend-due/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ due_date: extendDate }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        onToast({ type: 'error', text: json?.error || 'Failed to extend due date.' });
        return;
      }
      onToast({ type: 'success', text: 'Due date updated.' });
      setExtendOpen(false);
      setExtendUserId(null);
      onRefresh();
    } catch {
      onToast({ type: 'error', text: 'Network error while extending due date.' });
    } finally {
      setBusy(null);
    }
  };

  const tabs = [
    { id: 'all', name: 'All Users', count: users.length },
    { id: 'subscriptions', name: 'Active Subscriptions', count: subscriptions.length },
    { id: 'overdue', name: 'Overdue Payments', count: overdue.length },
  ] as const;

  const renderAllUsers = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-gray-600">
            <th className="px-4 py-3 text-left bg-white/70 border-b border-gray-200 rounded-tl-xl">User</th>
            <th className="px-4 py-3 text-left bg-white/70 border-b border-gray-200">Plan</th>
            <th className="px-4 py-3 text-left bg-white/70 border-b border-gray-200">Status</th>
            <th className="px-4 py-3 text-left bg-white/70 border-b border-gray-200">Started</th>
            <th className="px-4 py-3 text-left bg-white/70 border-b border-gray-200">Next Due</th>
            <th className="px-4 py-3 text-right bg-white/70 border-b border-gray-200">Amount</th>
            <th className="px-4 py-3 text-right bg-white/70 border-b border-gray-200 rounded-tr-xl">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td className="px-4 py-8 text-sm text-gray-600" colSpan={7}>
                Loading…
              </td>
            </tr>
          ) : users.length ? (
            users.map((u) => (
              <tr key={u.id} className="hover:bg-white/70">
                <td className="px-4 py-4 border-b border-gray-100">
                  <div className="text-sm font-semibold text-gray-900">{u.name || 'User'}</div>
                  <div className="text-xs text-gray-600">{u.email}</div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-700 border-b border-gray-100">{u.plan_label || '—'}</td>
                <td className="px-4 py-4 border-b border-gray-100">
                  <StatusBadge status={u.status} />
                </td>
                <td className="px-4 py-4 text-sm text-gray-700 border-b border-gray-100">
                  {u.started_at ? new Date(u.started_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-4 text-sm text-gray-700 border-b border-gray-100">
                  {u.next_due ? new Date(u.next_due).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 font-semibold text-right border-b border-gray-100">
                  {u.amount_cents ? formatUSD(u.amount_cents) : '—'}
                </td>
                <td className="px-4 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 disabled:opacity-60"
                      title="Download Invoice"
                      disabled={!token || busy !== null}
                      onClick={() => void downloadInvoice(u.id)}
                    >
                      <i className={`fas ${isBusy('invoice', u.id) ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
                    </button>
                    <button
                      type="button"
                      className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 disabled:opacity-60"
                      title="View Details"
                      disabled={busy !== null}
                      onClick={() => setSelectedUserId(u.id)}
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-10 text-sm text-gray-600" colSpan={7}>
                No users match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderOverdue = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-gray-600">
            <th className="px-4 py-3 text-left bg-white/70 border-b border-gray-200 rounded-tl-xl">User</th>
            <th className="px-4 py-3 text-left bg-white/70 border-b border-gray-200">Plan</th>
            <th className="px-4 py-3 text-right bg-white/70 border-b border-gray-200">Amount Due</th>
            <th className="px-4 py-3 text-left bg-white/70 border-b border-gray-200">Due Date</th>
            <th className="px-4 py-3 text-right bg-white/70 border-b border-gray-200">Days Past Due</th>
            <th className="px-4 py-3 text-right bg-white/70 border-b border-gray-200 rounded-tr-xl">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td className="px-4 py-8 text-sm text-gray-600" colSpan={6}>
                Loading…
              </td>
            </tr>
          ) : overdue.length ? (
            overdue.map((o) => (
              <tr key={o.user_id} className="hover:bg-white/70">
                <td className="px-4 py-4 border-b border-gray-100">
                  <div className="text-sm font-semibold text-gray-900">{o.user_name || 'User'}</div>
                  <div className="text-xs text-gray-600">{o.email}</div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-700 border-b border-gray-100">{o.plan_label}</td>
                <td className="px-4 py-4 text-sm text-gray-900 font-semibold text-right border-b border-gray-100">{formatUSD(o.amount_cents)}</td>
                <td className="px-4 py-4 text-sm text-gray-700 border-b border-gray-100">{o.due_date || '—'}</td>
                <td className="px-4 py-4 text-sm text-red-700 font-semibold text-right border-b border-gray-100">{o.days_past_due}</td>
                <td className="px-4 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 disabled:opacity-60"
                      title="Send Reminder"
                      disabled={!token || busy !== null}
                      onClick={() => void sendReminder(o.user_id)}
                    >
                      <i className={`fas ${isBusy('reminder', o.user_id) ? 'fa-spinner fa-spin' : 'fa-envelope'}`}></i>
                    </button>
                    <button
                      type="button"
                      className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 disabled:opacity-60"
                      title="Extend Date"
                      disabled={!token || busy !== null}
                      onClick={() => openExtend(o.user_id)}
                    >
                      <i className={`fas ${isBusy('extend', o.user_id) ? 'fa-spinner fa-spin' : 'fa-calendar-plus'}`}></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-10 text-sm text-gray-600" colSpan={6}>
                No overdue payments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderSubscriptions = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-gray-600">
            <th className="px-4 py-3 text-left bg-white/70 border-b border-gray-200 rounded-tl-xl">User</th>
            <th className="px-4 py-3 text-left bg-white/70 border-b border-gray-200">Plan</th>
            <th className="px-4 py-3 text-right bg-white/70 border-b border-gray-200">Amount</th>
            <th className="px-4 py-3 text-left bg-white/70 border-b border-gray-200">Start</th>
            <th className="px-4 py-3 text-left bg-white/70 border-b border-gray-200">Next Payment</th>
            <th className="px-4 py-3 text-left bg-white/70 border-b border-gray-200 rounded-tr-xl">Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td className="px-4 py-8 text-sm text-gray-600" colSpan={6}>
                Loading…
              </td>
            </tr>
          ) : subscriptions.length ? (
            subscriptions.map((s) => (
              <tr key={s.user_id} className="hover:bg-white/70">
                <td className="px-4 py-4 border-b border-gray-100">
                  <div className="text-sm font-semibold text-gray-900">{s.user_name || 'User'}</div>
                  <div className="text-xs text-gray-600">{s.user_email}</div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-700 border-b border-gray-100">{s.plan_label}</td>
                <td className="px-4 py-4 text-sm text-gray-900 font-semibold text-right border-b border-gray-100">{formatUSD(s.amount_cents)}</td>
                <td className="px-4 py-4 text-sm text-gray-700 border-b border-gray-100">{s.start_date || '—'}</td>
                <td className="px-4 py-4 text-sm text-gray-700 border-b border-gray-100">{s.next_payment || '—'}</td>
                <td className="px-4 py-4 border-b border-gray-100">
                  <StatusBadge status={s.status} />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-10 text-sm text-gray-600" colSpan={6}>
                No active subscriptions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderTab = () => {
    if (activeTab === 'overdue') return renderOverdue();
    if (activeTab === 'subscriptions') return renderSubscriptions();
    return renderAllUsers();
  };

  return (
    <div className="glass-effect rounded-2xl border border-white/20 shadow-sm mb-8">
      <div className="border-b border-white/30">
        <nav className="flex flex-wrap gap-2 p-4" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 border-white/40 shadow-sm'
                  : 'bg-white/50 text-gray-700 border-white/20 hover:bg-white'
              }`}
            >
              {tab.name}
              <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-900">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {renderTab()}
      </div>

      <ConfirmDialog
        open={extendOpen}
        title="Extend due date"
        description={
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-700">Select a new due date</div>
            <input
              type="date"
              value={extendDate}
              onChange={(e) => setExtendDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        }
        confirmText="Update"
        cancelText="Cancel"
        busy={extendUserId ? isBusy('extend', extendUserId) : false}
        onConfirm={() => void submitExtend()}
        onClose={() => {
          if (busy) return;
          setExtendOpen(false);
          setExtendUserId(null);
        }}
      />

      {mounted && selectedUser
        ? createPortal(
            <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedUserId(null)}></div>
              <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-extrabold text-gray-900 tracking-tight">Payment details</div>
                    <div className="text-xs text-gray-600 mt-1">{selectedUser.email}</div>
                  </div>
                  <button
                    type="button"
                    className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-800"
                    onClick={() => setSelectedUserId(null)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="px-5 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <div className="text-xs font-semibold text-gray-600">User</div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">{selectedUser.name || 'User'}</div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <div className="text-xs font-semibold text-gray-600">Status</div>
                      <div className="mt-1">
                        <StatusBadge status={selectedUser.status} />
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <div className="text-xs font-semibold text-gray-600">Plan</div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">{selectedUser.plan_label || '—'}</div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <div className="text-xs font-semibold text-gray-600">Amount</div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        {selectedUser.amount_cents ? formatUSD(selectedUser.amount_cents) : '—'}
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <div className="text-xs font-semibold text-gray-600">Started</div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        {selectedUser.started_at ? new Date(selectedUser.started_at).toLocaleDateString() : '—'}
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <div className="text-xs font-semibold text-gray-600">Next due</div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        {selectedUser.next_due ? new Date(selectedUser.next_due).toLocaleDateString() : '—'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
                  {selectedUser.status === 'overdue' ? (
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-extrabold text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-60"
                      disabled={!token || busy !== null}
                      onClick={() => void sendReminder(selectedUser.id)}
                    >
                      <i className={`fas ${isBusy('reminder', selectedUser.id) ? 'fa-spinner fa-spin' : 'fa-envelope'} mr-2`}></i>
                      Send Reminder
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-extrabold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
                    style={{ backgroundColor: 'var(--azul-ultramar)' }}
                    disabled={!token || busy !== null}
                    onClick={() => void downloadInvoice(selectedUser.id)}
                  >
                    <i className={`fas ${isBusy('invoice', selectedUser.id) ? 'fa-spinner fa-spin' : 'fa-download'} mr-2`}></i>
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
