'use client';

import { useEffect, useState } from 'react';

const API_AUTH_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '') + '/api/auth';

function useAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

type ApiUser = {
  id: string;
  name: string | null;
  email: string;
  country: string | null;
  native_language: string | null;
  is_active: boolean;
  last_login: string | null;
};

export default function PaymentStatusTable() {
  const token = useAccessToken();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_AUTH_BASE}/users/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUsers(Array.isArray(data.users) ? data.users : []);
    } catch {}
    setLoading(false);
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
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Status Overview</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-sm text-gray-500">Loading...</td>
              </tr>
            )}
            {!loading && users.map((u) => {
              const status = u.is_active ? 'Active' : 'Inactive';
              const statusColor = u.is_active ? 'bg-green-100 text-green-800' : 'bg-neutral-200 text-neutral-800';
              return (
                <tr key={u.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name || u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.country || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>{status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                </tr>
              );
            })}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-sm text-gray-500">No users</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
