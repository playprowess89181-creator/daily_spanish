'use client';

import React, { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || '') + '/api/auth';

function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

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

type ApiReceipt = {
  id: string;
  date: string;
  course: string;
  amount: string;
  status: 'Paid' | 'Pending' | string;
  invoice_id: string;
};

const Receipts = () => {
  const token = getAccessToken();
  const [receipts, setReceipts] = useState<ApiReceipt[]>([]);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/receipts/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
          setReceipts((json?.receipts || []) as ApiReceipt[]);
        } else {
          setReceipts([]);
        }
      } catch {
        setReceipts([]);
      }
    };
    void load();
  }, [token]);

  const rows = useMemo(() => receipts || [], [receipts]);

  const download = async (r: ApiReceipt) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/receipts/${encodeURIComponent(r.id)}/download/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const filename = parseFilenameFromDisposition(res.headers.get('content-disposition')) || `${r.invoice_id || 'receipt'}.pdf`;
      triggerDownload(blob, filename);
    } catch {}
  };

  return (
    <div>
      <h3 className="text-2xl font-bold gradient-text mb-6" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>
        Receipts
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full bg-white/50 backdrop-blur-sm rounded-xl overflow-hidden">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course/Package</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.course}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`${String(r.status).toLowerCase() === 'paid' ? 'status-paid' : 'status-pending'} px-3 py-1 rounded-full text-xs font-medium`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.invoice_id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    className={`${String(r.status).toLowerCase() === 'paid' ? 'btn-mint' : 'btn-ochre'} px-4 py-2 rounded-lg text-sm font-medium`}
                    onClick={() => void download(r)}
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Receipts;
