'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../../lib/AuthContext';

type ApiUser = {
  id: string;
  name: string | null;
  email: string;
  country: string | null;
  native_language: string | null;
  nickname: string | null;
  gender: string | null;
  age: number | null;
  profile_image: string | null;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
};

export default function UsersTable() {
  const { user } = useAuth();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(false);

  const formatRelative = (iso?: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const base = process.env.NEXT_PUBLIC_API_BASE_URL;
      const token = typeof window !== 'undefined' ? (localStorage.getItem('access_token') || sessionStorage.getItem('access_token')) : null;
      try {
        const res = await fetch(`${base}/api/auth/users/`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          const list: ApiUser[] = Array.isArray(data.users) ? data.users : [];
          const filtered = list.filter(u => u.email !== user?.email);
          setUsers(filtered);
        } else {
          setUsers([]);
        }
      } catch {
        setUsers([]);
      }
      setLoading(false);
    };
    run();
  }, [user]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'view': return 'fas fa-eye';
      case 'edit': return 'fas fa-edit';
      case 'deactivate': return 'fas fa-pause';
      case 'activate': return 'fas fa-play';
      case 'block': return 'fas fa-ban';
      case 'unblock': return 'fas fa-unlock';
      case 'extend-payment': return 'fas fa-calendar-plus';
      case 'delete': return 'fas fa-trash';
      default: return 'fas fa-cog';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'view': return 'var(--azul-ultramar)';
      case 'edit': return 'var(--ocre)';
      case 'deactivate': return 'var(--naranja)';
      case 'activate': return 'var(--verde-menta)';
      case 'block': return '#dc2626';
      case 'unblock': return 'var(--verde-menta)';
      case 'extend-payment': return 'var(--naranja)';
      case 'delete': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getActionTitle = (action: string) => {
    switch (action) {
      case 'view': return 'View Details';
      case 'edit': return 'Edit';
      case 'deactivate': return 'Deactivate';
      case 'activate': return 'Activate';
      case 'block': return 'Block';
      case 'unblock': return 'Unblock';
      case 'extend-payment': return 'Extend Payment';
      case 'delete': return 'Delete';
      default: return 'Action';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">User Accounts</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 focus:ring-2"
                  style={{
                    '--tw-ring-color': 'var(--azul-ultramar)',
                    accentColor: 'var(--azul-ultramar)'
                  } as React.CSSProperties}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
              </tr>
            )}
            {!loading && users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 focus:ring-2"
                    style={{
                      '--tw-ring-color': 'var(--azul-ultramar)',
                      accentColor: 'var(--azul-ultramar)'
                    } as React.CSSProperties}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                      {u.profile_image ? (
                        <img src={u.profile_image} alt="avatar" className="h-full w-full object-cover" />
                      ) : (
                        <i className="fas fa-user text-gray-500"></i>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{u.name || u.email}</div>
                      <div className="text-sm text-gray-500">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.country || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span 
                    className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    style={{
                      backgroundColor: 'var(--neutral-200)',
                      color: '#374151'
                    }}
                  >
                    N/A
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span 
                    className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    style={{
                      backgroundColor: 'var(--neutral-200)',
                      color: '#374151'
                    }}
                  >
                    N/A
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span 
                    className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    style={{
                      backgroundColor: u.is_active ? 'var(--verde-menta)' : '#fecaca',
                      color: u.is_active ? '#374151' : '#991b1b'
                    }}
                  >
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatRelative(u.last_login || u.date_joined)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {['view', 'edit', u.is_active ? 'deactivate' : 'activate', 'block', 'delete'].map((action, index) => (
                      <button 
                        key={index}
                        className="hover:opacity-70 transition-opacity"
                        title={getActionTitle(action)}
                        style={{ color: getActionColor(action) }}
                        onClick={() => {
                          if (action === 'delete') {
                            const confirmed = window.confirm(`Delete user ${u.email}?`);
                            if (!confirmed) return;
                            const base = process.env.NEXT_PUBLIC_API_BASE_URL;
                            const token = typeof window !== 'undefined' ? (localStorage.getItem('access_token') || sessionStorage.getItem('access_token')) : null;
                            fetch(`${base}/api/auth/users/${u.id}/`, {
                              method: 'DELETE',
                              headers: {
                                'Authorization': token ? `Bearer ${token}` : '',
                                'Content-Type': 'application/json'
                              }
                            }).then(async (res) => {
                              if (res.ok) {
                                setUsers(prev => prev.filter(x => x.id !== u.id));
                                if (typeof window !== 'undefined') {
                                  window.dispatchEvent(new CustomEvent('users:changed'));
                                }
                              }
                            }).catch(() => {});
                          }
                        }}
                      >
                        <i className={getActionIcon(action)}></i>
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Previous
          </button>
          <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{users.length}</span> users
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <i className="fas fa-chevron-left"></i>
              </button>
              <button 
                className="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                style={{
                  backgroundColor: 'var(--azul-ultramar)',
                  borderColor: 'var(--azul-ultramar)',
                  color: 'white'
                }}
              >
                1
              </button>
              <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                2
              </button>
              <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                3
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <i className="fas fa-chevron-right"></i>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
