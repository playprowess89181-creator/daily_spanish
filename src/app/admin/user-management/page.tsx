'use client';

import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SearchFilters, { type UserFilters } from './components/SearchFilters';
import UserStatsCards from './components/UserStatsCards';
import UsersTable, { type ApiUser } from './components/UsersTable';
import BulkActions from './components/BulkActions';
import { useAuth, withAdminAuth } from '../../../lib/AuthContext';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '../components/ConfirmDialog';

const DEFAULT_FILTERS: UserFilters = {
  query: '',
  country: '',
  nativeLanguage: '',
  level: '',
  status: ''
};

function UserManagement() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<UserFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const base = process.env.NEXT_PUBLIC_API_BASE_URL;
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
          : null;
      try {
        const res = await fetch(`${base}/api/auth/users/`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          const list: ApiUser[] = Array.isArray(data.users) ? data.users : [];
          const filtered = list.filter((u) => u.email !== user?.email);
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

    const onChanged = () => run();
    if (typeof window !== 'undefined') {
      window.addEventListener('users:changed', onChanged as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('users:changed', onChanged as EventListener);
      }
    };
  }, [user]);

  const countryOptions = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => {
      if (u.country) set.add(u.country);
    });
    return Array.from(set);
  }, [users]);

  const nativeLanguageOptions = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => {
      if (u.native_language) set.add(u.native_language);
    });
    return Array.from(set);
  }, [users]);

  const levelOptions = useMemo(
    () => [
      { value: 'A1', label: 'A1 – Beginner' },
      { value: 'A2', label: 'A2 – Elementary' },
      { value: 'B1', label: 'B1 – Intermediate' },
      { value: 'B2', label: 'B2 – Upper-Intermediate' },
      { value: 'C1', label: 'C1 – Advanced' }
    ],
    []
  );

  const statusOptions = useMemo(
    () => [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'blocked', label: 'Blocked' }
    ],
    []
  );

  const filteredUsers = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return users.filter((u) => {
      if (q) {
        const hay =
          `${u.name || ''} ${u.email || ''} ${u.nickname || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.country && (u.country || '') !== filters.country) return false;
      if (filters.nativeLanguage && (u.native_language || '') !== filters.nativeLanguage) return false;
      if (filters.level) {
        const lvl = (u.level || '').trim();
        if (lvl && lvl !== filters.level) return false;
        if (!lvl) return false;
      }
      if (filters.status === 'blocked' && !u.is_blocked) return false;
      if (filters.status === 'active' && (!u.is_active || u.is_blocked)) return false;
      if (filters.status === 'inactive' && (u.is_active || u.is_blocked)) return false;
      return true;
    });
  }, [filters, users]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredUsers.length / pageSize)), [filteredUsers.length]);

  useEffect(() => {
    setPage(1);
  }, [filters.country, filters.nativeLanguage, filters.level, filters.status, filters.query]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const existing = new Set(users.map((u) => u.id));
      const next = new Set<string>();
      prev.forEach((id) => {
        if (existing.has(id)) next.add(id);
      });
      return next;
    });
  }, [users]);

  const pageUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page, pageSize]);

  const userStats = useMemo(() => {
    const totalUsers = users.length;
    const blockedUsers = users.filter((u) => Boolean(u.is_blocked)).length;
    const activeUsers = users.filter((u) => u.is_active && !u.is_blocked).length;
    const inactiveUsers = users.filter((u) => !u.is_active && !u.is_blocked).length;
    return { totalUsers, activeUsers, inactiveUsers, blockedUsers };
  }, [users]);

  const onFiltersChange = (next: Partial<UserFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const setPageSelection = (userIds: string[], selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      userIds.forEach((id) => {
        if (selected) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const [confirm, setConfirm] = useState<{
    open: boolean;
    title: string;
    description?: string;
    confirmText?: string;
    variant?: 'primary' | 'danger';
    busy?: boolean;
    action?: () => Promise<void>;
  }>({ open: false, title: '' });
  const [actionError, setActionError] = useState('');

  const apiPatchUser = async (userId: string, patch: Record<string, unknown>) => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
        : null;
    const res = await fetch(`${base}/api/auth/users/${userId}/`, {
      method: 'PATCH',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patch)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Update failed');
  };

  const apiDeleteUser = async (u: ApiUser) => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
        : null;
    const res = await fetch(`${base}/api/auth/users/${u.id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Delete failed');
    setUsers((prev) => prev.filter((x) => x.id !== u.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(u.id);
      return next;
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('users:changed'));
    }
  };

  const handleRowAction = (u: ApiUser, action: string) => {
    if (action === 'view') {
      router.push(`/admin/user-management/${u.id}`);
      return;
    }
    if (action === 'edit') {
      router.push(`/admin/user-management/${u.id}/edit`);
      return;
    }

    const actionLabel =
      action === 'delete'
        ? 'Delete'
        : action === 'activate'
          ? 'Activate'
          : action === 'deactivate'
            ? 'Deactivate'
            : action === 'block'
              ? 'Block'
              : action === 'unblock'
                ? 'Unblock'
                : 'Confirm';

    const title =
      action === 'delete'
        ? 'Delete user?'
        : action === 'activate'
          ? 'Activate user?'
          : action === 'deactivate'
            ? 'Deactivate user?'
            : action === 'block'
              ? 'Block user?'
              : action === 'unblock'
                ? 'Unblock user?'
                : 'Confirm action?';

    const description =
      action === 'delete'
        ? `This will permanently delete ${u.email}.`
        : action === 'activate'
          ? `This will allow ${u.email} to sign in.`
          : action === 'deactivate'
            ? `This will prevent ${u.email} from signing in until reactivated.`
            : action === 'block'
              ? `This will immediately block ${u.email} from signing in.`
              : action === 'unblock'
                ? `This will allow ${u.email} to sign in again (if active).`
                : '';

    setConfirm({
      open: true,
      title,
      description,
      confirmText: actionLabel,
      variant: action === 'delete' || action === 'block' || action === 'deactivate' ? 'danger' : 'primary',
      action: async () => {
        if (action === 'delete') {
          await apiDeleteUser(u);
          return;
        }
        if (action === 'activate') {
          await apiPatchUser(u.id, { is_active: true });
          setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_active: true } : x)));
        } else if (action === 'deactivate') {
          await apiPatchUser(u.id, { is_active: false });
          setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_active: false } : x)));
        } else if (action === 'block') {
          await apiPatchUser(u.id, { is_blocked: true });
          setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_blocked: true } : x)));
        } else if (action === 'unblock') {
          await apiPatchUser(u.id, { is_blocked: false });
          setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_blocked: false } : x)));
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('users:changed'));
        }
      },
    });
  };

  const handleBulkAction = (action: 'activate' | 'deactivate' | 'block' | 'unblock') => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;

    const title =
      action === 'activate'
        ? 'Activate selected users?'
        : action === 'deactivate'
          ? 'Deactivate selected users?'
          : action === 'block'
            ? 'Block selected users?'
            : 'Unblock selected users?';

    const description =
      action === 'activate'
        ? `This will allow ${ids.length} user(s) to sign in.`
        : action === 'deactivate'
          ? `This will prevent ${ids.length} user(s) from signing in.`
          : action === 'block'
            ? `This will immediately block ${ids.length} user(s) from signing in.`
            : `This will allow ${ids.length} user(s) to sign in again (if active).`;

    setConfirm({
      open: true,
      title,
      description,
      confirmText:
        action === 'activate'
          ? 'Activate'
          : action === 'deactivate'
            ? 'Deactivate'
            : action === 'block'
              ? 'Block'
              : 'Unblock',
      variant: action === 'activate' || action === 'unblock' ? 'primary' : 'danger',
      action: async () => {
        for (const userId of ids) {
          if (action === 'activate') await apiPatchUser(userId, { is_active: true });
          if (action === 'deactivate') await apiPatchUser(userId, { is_active: false });
          if (action === 'block') await apiPatchUser(userId, { is_blocked: true });
          if (action === 'unblock') await apiPatchUser(userId, { is_blocked: false });
        }
        setUsers((prev) =>
          prev.map((u) => {
            if (!selectedIds.has(u.id)) return u;
            if (action === 'activate') return { ...u, is_active: true };
            if (action === 'deactivate') return { ...u, is_active: false };
            if (action === 'block') return { ...u, is_blocked: true };
            return { ...u, is_blocked: false };
          })
        );
        clearSelection();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('users:changed'));
        }
      },
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} activeItem="user-management" />
      
      {/* Main Content */}
      <div className="lg:ml-64 flex flex-col flex-1">
        <Header 
          title="User Management" 
          onToggleSidebar={toggleSidebar}
          showAddButton={true}
          addButtonText="Add User"
          addButtonIcon="fas fa-plus"
          onAddClick={() => router.push('/admin/user-management/add')}
        />
        
        {/* User Management Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {actionError ? (
              <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold">
                {actionError}
              </div>
            ) : null}
            {/* Search and Filters */}
            <SearchFilters
              filters={filters}
              onChange={onFiltersChange}
              countryOptions={countryOptions}
              nativeLanguageOptions={nativeLanguageOptions}
              levelOptions={levelOptions}
              statusOptions={statusOptions}
              resultCount={filteredUsers.length}
            />
            
            {/* User Statistics Cards */}
            <UserStatsCards
              totalUsers={userStats.totalUsers}
              activeUsers={userStats.activeUsers}
              inactiveUsers={userStats.inactiveUsers}
              blockedUsers={userStats.blockedUsers}
            />

            <BulkActions
              selectedCount={selectedIds.size}
              onAction={handleBulkAction}
              onClearSelection={clearSelection}
            />
            
            {/* Users Table */}
            <UsersTable
              users={pageUsers}
              total={filteredUsers.length}
              loading={loading}
              page={page}
              pageSize={pageSize}
              selectedIds={selectedIds}
              onToggleUser={toggleUserSelection}
              onSetPageSelection={setPageSelection}
              onPageChange={setPage}
              onRowAction={handleRowAction}
            />
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        description={confirm.description}
        confirmText={confirm.confirmText}
        variant={confirm.variant}
        busy={Boolean(confirm.busy)}
        onClose={() => setConfirm({ open: false, title: '' })}
        onConfirm={async () => {
          if (!confirm.action) return;
          setConfirm((prev) => ({ ...prev, busy: true }));
          setActionError('');
          try {
            await confirm.action();
          } catch (e) {
            setActionError(e instanceof Error ? e.message : 'Action failed');
          } finally {
            setConfirm({ open: false, title: '' });
          }
        }}
      />
    </div>
  );
}

export default withAdminAuth(UserManagement);
