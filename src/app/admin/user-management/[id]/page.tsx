'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import ConfirmDialog from '../../components/ConfirmDialog';
import { withAdminAuth } from '../../../../lib/AuthContext';

type UserDetail = {
  id: string;
  name: string | null;
  email: string;
  country: string | null;
  native_language: string | null;
  level: string | null;
  nickname: string | null;
  gender: string | null;
  age: number | null;
  profile_image: string | null;
  is_active: boolean;
  is_blocked: boolean;
  date_joined: string;
  last_login: string | null;
};

function useAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return '—';
  }
}

function UserViewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const token = useAccessToken();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<UserDetail | null>(null);

  const [confirm, setConfirm] = useState<{
    open: boolean;
    title: string;
    description?: string;
    confirmText?: string;
    variant?: 'primary' | 'danger';
    action?: () => Promise<void>;
  }>({ open: false, title: '' });

  const statusPill = useMemo(() => {
    if (!user) return null;
    if (user.is_blocked) {
      return <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-700">Blocked</span>;
    }
    if (!user.is_active) {
      return <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-extrabold bg-orange-100 text-orange-700">Deactivated</span>;
    }
    return <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-extrabold bg-green-100 text-green-800">Active</span>;
  }, [user]);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    try {
      const res = await fetch(`${base}/api/auth/users/${id}/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Failed to load user');
        setUser(null);
      } else {
        setUser(data.user);
      }
    } catch {
      setError('Network error. Please try again.');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const runPatch = async (patch: Record<string, unknown>) => {
    if (!id) return;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    const res = await fetch(`${base}/api/auth/users/${id}/`, {
      method: 'PATCH',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Action failed');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('users:changed'));
    }
  };

  const runDelete = async () => {
    if (!id) return;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    const res = await fetch(`${base}/api/auth/users/${id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Delete failed');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('users:changed'));
    }
    router.push('/admin/user-management');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} activeItem="user-management" />
      <div className="lg:ml-64 flex flex-col flex-1">
        <Header title="User Details" onToggleSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {error ? (
              <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold">
                {error}
              </div>
            ) : null}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-gray-200 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center flex-none">
                      <i className="fas fa-user text-[var(--azul-ultramar)] text-lg"></i>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xl font-extrabold text-gray-900 tracking-tight truncate">
                        {user?.name || user?.email || (loading ? 'Loading…' : '—')}
                      </div>
                      <div className="text-sm font-semibold text-gray-600 truncate">{user?.email || '—'}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {statusPill}
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-extrabold text-gray-800 hover:bg-gray-100 focus:outline-none"
                    onClick={() => router.push('/admin/user-management')}
                  >
                    <i className="fas fa-arrow-left text-gray-500"></i>
                    Back
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-extrabold text-white hover:opacity-90 focus:outline-none"
                    style={{ backgroundColor: 'var(--azul-ultramar)' }}
                    onClick={() => router.push(`/admin/user-management/${id}/edit`)}
                    disabled={!id}
                  >
                    <i className="fas fa-pen"></i>
                    Edit
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-extrabold text-white hover:opacity-90 focus:outline-none"
                    style={{ backgroundColor: user?.is_active ? 'var(--naranja)' : 'var(--verde-menta)' }}
                    disabled={!user}
                    onClick={() => {
                      if (!user) return;
                      const nextActive = !user.is_active;
                      setConfirm({
                        open: true,
                        title: nextActive ? 'Activate user?' : 'Deactivate user?',
                        description: nextActive
                          ? `This will allow ${user.email} to sign in.`
                          : `This will prevent ${user.email} from signing in until reactivated.`,
                        confirmText: nextActive ? 'Activate' : 'Deactivate',
                        variant: nextActive ? 'primary' : 'danger',
                        action: async () => {
                          await runPatch({ is_active: nextActive });
                          await load();
                        },
                      });
                    }}
                  >
                    <i className={`fas ${user?.is_active ? 'fa-pause' : 'fa-play'}`}></i>
                    {user?.is_active ? 'Deactivate' : 'Activate'}
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-extrabold text-white hover:opacity-90 focus:outline-none"
                    style={{ backgroundColor: user?.is_blocked ? 'var(--verde-menta)' : '#ef4444' }}
                    disabled={!user}
                    onClick={() => {
                      if (!user) return;
                      const nextBlocked = !user.is_blocked;
                      setConfirm({
                        open: true,
                        title: nextBlocked ? 'Block user?' : 'Unblock user?',
                        description: nextBlocked
                          ? `This will immediately prevent ${user.email} from signing in.`
                          : `This will allow ${user.email} to sign in again (if active).`,
                        confirmText: nextBlocked ? 'Block' : 'Unblock',
                        variant: nextBlocked ? 'danger' : 'primary',
                        action: async () => {
                          await runPatch({ is_blocked: nextBlocked });
                          await load();
                        },
                      });
                    }}
                  >
                    <i className={`fas ${user?.is_blocked ? 'fa-unlock' : 'fa-ban'}`}></i>
                    {user?.is_blocked ? 'Unblock' : 'Block'}
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-extrabold text-white hover:opacity-90 focus:outline-none"
                    style={{ backgroundColor: '#ef4444' }}
                    disabled={!user}
                    onClick={() => {
                      if (!user) return;
                      setConfirm({
                        open: true,
                        title: 'Delete user?',
                        description: `This will permanently delete ${user.email}.`,
                        confirmText: 'Delete',
                        variant: 'danger',
                        action: runDelete,
                      });
                    }}
                  >
                    <i className="fas fa-trash"></i>
                    Delete
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Country', value: user?.country || '—', icon: 'fas fa-globe' },
                    { label: 'Native Language', value: user?.native_language || '—', icon: 'fas fa-language' },
                    { label: 'Level', value: user?.level || '—', icon: 'fas fa-layer-group' },
                    { label: 'Nickname', value: user?.nickname || '—', icon: 'fas fa-id-badge' },
                    { label: 'Gender', value: user?.gender || '—', icon: 'fas fa-venus-mars' },
                    { label: 'Age', value: user?.age != null ? String(user.age) : '—', icon: 'fas fa-hashtag' },
                    { label: 'Joined', value: user ? formatDate(user.date_joined) : '—', icon: 'fas fa-calendar' },
                    { label: 'Last Login', value: user ? formatDate(user.last_login) : '—', icon: 'fas fa-clock' },
                  ].map((row) => (
                    <div key={row.label} className="rounded-xl border border-gray-200 bg-white p-4 flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center flex-none">
                        <i className={`${row.icon} text-[var(--azul-ultramar)]`}></i>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">{row.label}</div>
                        <div className="mt-1 text-sm font-extrabold text-gray-900 truncate">{row.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {user?.profile_image ? (
                  <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-2">Profile Image</div>
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
                        <img src={user.profile_image} alt="avatar" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 text-sm font-semibold text-gray-700 truncate">{user.profile_image}</div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        description={confirm.description}
        confirmText={confirm.confirmText}
        variant={confirm.variant}
        busy={loading}
        onClose={() => setConfirm({ open: false, title: '' })}
        onConfirm={async () => {
          if (!confirm.action) return;
          setLoading(true);
          setError('');
          try {
            await confirm.action();
            setConfirm({ open: false, title: '' });
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Action failed');
            setConfirm({ open: false, title: '' });
          } finally {
            setLoading(false);
          }
        }}
      />
    </div>
  );
}

export default withAdminAuth(UserViewPage);

