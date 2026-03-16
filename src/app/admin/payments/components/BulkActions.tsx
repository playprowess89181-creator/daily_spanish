'use client';

import { useMemo, useState } from 'react';

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

export default function BulkActions({
  token,
  overdueCount,
  onToast,
  onComplete,
}: {
  token: string | null;
  overdueCount: number;
  onToast: (t: { type: 'success' | 'error'; text: string } | null) => void;
  onComplete: () => void;
}) {
  const [busy, setBusy] = useState<'send' | 'invoices' | 'report' | null>(null);

  const actions = useMemo(
    () => [
      {
        id: 'send' as const,
        label: 'Send Payment Reminders',
        icon: 'fas fa-envelope',
        accent: 'from-orange-500 to-rose-500',
        description: `${overdueCount.toLocaleString()} overdue account${overdueCount === 1 ? '' : 's'}`,
      },
      {
        id: 'invoices' as const,
        label: 'Download Invoices (PDF)',
        icon: 'fas fa-download',
        accent: 'from-emerald-500 to-teal-600',
        description: 'ZIP of all user invoices',
      },
      {
        id: 'report' as const,
        label: 'Export Financial Report',
        icon: 'fas fa-file-export',
        accent: 'from-blue-600 to-indigo-600',
        description: 'Excel (.xlsx)',
      },
    ],
    [overdueCount]
  );

  const sendReminders = async () => {
    if (!token) return;
    if (busy) return;
    onToast(null);
    setBusy('send');
    try {
      const res = await fetch(`${API_AUTH_BASE}/admin/payments/send-reminders/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        onToast({ type: 'error', text: json?.error || 'Failed to send reminders.' });
        return;
      }
      onToast({ type: 'success', text: `Sent reminders to ${Number(json?.sent_to || 0).toLocaleString()} users.` });
      onComplete();
    } catch {
      onToast({ type: 'error', text: 'Network error while sending reminders.' });
    } finally {
      setBusy(null);
    }
  };

  const downloadInvoices = async () => {
    if (!token) return;
    if (busy) return;
    onToast(null);
    setBusy('invoices');
    try {
      const res = await fetch(`${API_AUTH_BASE}/admin/payments/download-invoices/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        onToast({ type: 'error', text: json?.error || 'Failed to download invoices.' });
        return;
      }
      const blob = await res.blob();
      const filename = parseFilenameFromDisposition(res.headers.get('content-disposition')) || 'invoices.zip';
      triggerDownload(blob, filename);
      onToast({ type: 'success', text: 'Invoices download started.' });
    } catch {
      onToast({ type: 'error', text: 'Network error while downloading invoices.' });
    } finally {
      setBusy(null);
    }
  };

  const exportReport = async () => {
    if (!token) return;
    if (busy) return;
    onToast(null);
    setBusy('report');
    try {
      const res = await fetch(`${API_AUTH_BASE}/admin/payments/financial-report/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        onToast({ type: 'error', text: json?.error || 'Failed to export financial report.' });
        return;
      }
      const blob = await res.blob();
      const filename = parseFilenameFromDisposition(res.headers.get('content-disposition')) || 'financial_report.xlsx';
      triggerDownload(blob, filename);
      onToast({ type: 'success', text: 'Financial report download started.' });
    } catch {
      onToast({ type: 'error', text: 'Network error while exporting report.' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="glass-effect rounded-2xl border border-white/20 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Bulk Actions</h3>
          <div className="text-sm text-gray-600 mt-1">Run actions across the current dataset</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {actions.map((a) => (
          <button
            key={a.id}
            type="button"
            disabled={!token || busy !== null}
            onClick={() => {
              if (a.id === 'send') void sendReminders();
              if (a.id === 'invoices') void downloadInvoices();
              if (a.id === 'report') void exportReport();
            }}
            className="text-left rounded-2xl p-5 bg-white/70 border border-white/30 hover:bg-white shadow-sm transition-colors disabled:opacity-60"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">{a.label}</div>
                <div className="text-xs text-gray-600 mt-1">{a.description}</div>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.accent} text-white flex items-center justify-center`}>
                <i className={`${busy === a.id ? 'fas fa-spinner fa-spin' : a.icon}`}></i>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
