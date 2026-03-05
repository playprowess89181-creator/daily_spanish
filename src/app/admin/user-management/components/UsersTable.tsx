'use client';

export type ApiUser = {
  id: string;
  name: string | null;
  email: string;
  country: string | null;
  native_language: string | null;
  level?: string | null;
  is_blocked?: boolean;
  nickname: string | null;
  gender: string | null;
  age: number | null;
  profile_image: string | null;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
};

type UsersTableProps = {
  users: ApiUser[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  selectedIds: Set<string>;
  onToggleUser: (userId: string) => void;
  onSetPageSelection: (userIds: string[], selected: boolean) => void;
  onPageChange: (page: number) => void;
  onRowAction: (user: ApiUser, action: string) => void;
};

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

const getVisiblePages = (current: number, totalPages: number) => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: Array<number | '...'> = [];
  const left = Math.max(2, current - 1);
  const right = Math.min(totalPages - 1, current + 1);

  pages.push(1);
  if (left > 2) pages.push('...');
  for (let p = left; p <= right; p += 1) pages.push(p);
  if (right < totalPages - 1) pages.push('...');
  pages.push(totalPages);
  return pages;
};

export default function UsersTable({
  users,
  total,
  loading,
  page,
  pageSize,
  selectedIds,
  onToggleUser,
  onSetPageSelection,
  onPageChange,
  onRowAction,
}: UsersTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageUserIds = users.map((u) => u.id);
  const allSelectedOnPage = pageUserIds.length > 0 && pageUserIds.every((id) => selectedIds.has(id));
  const someSelectedOnPage = pageUserIds.some((id) => selectedIds.has(id));

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'view': return 'fas fa-eye';
      case 'edit': return 'fas fa-edit';
      case 'deactivate': return 'fas fa-pause';
      case 'activate': return 'fas fa-play';
      case 'block': return 'fas fa-ban';
      case 'unblock': return 'fas fa-unlock';
      case 'delete': return 'fas fa-trash';
      default: return 'fas fa-cog';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'view': return 'var(--azul-ultramar)';
      case 'edit': return 'var(--amarillo-ocre)';
      case 'deactivate': return 'var(--naranja)';
      case 'activate': return 'var(--verde-menta)';
      case 'block': return '#dc2626';
      case 'unblock': return 'var(--verde-menta)';
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
      case 'delete': return 'Delete';
      default: return 'Action';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-3">
        <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">User Accounts</h3>
        <div className="text-sm font-semibold text-gray-600">
          {loading ? 'Loading…' : `${total} users`}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-gray-300 outline-none focus:outline-none focus:ring-0"
                  style={{
                    accentColor: 'var(--azul-ultramar)'
                  } as React.CSSProperties}
                  checked={allSelectedOnPage}
                  ref={(el) => {
                    if (el) el.indeterminate = !allSelectedOnPage && someSelectedOnPage;
                  }}
                  onChange={(e) => onSetPageSelection(pageUserIds, e.target.checked)}
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
            {!loading && total === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
            {!loading && users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 rounded border-gray-300 outline-none focus:outline-none focus:ring-0"
                    style={{
                      accentColor: 'var(--azul-ultramar)'
                    } as React.CSSProperties}
                    checked={selectedIds.has(u.id)}
                    onChange={() => onToggleUser(u.id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-none">
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
                    className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full"
                    style={{
                      backgroundColor: 'var(--neutral-200)',
                      color: '#374151'
                    }}
                  >
                    {u.level || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span 
                    className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full"
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
                    className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full"
                    style={{
                      backgroundColor: u.is_blocked ? '#fee2e2' : (u.is_active ? 'var(--verde-menta)' : '#ffedd5'),
                      color: u.is_blocked ? '#991b1b' : (u.is_active ? '#374151' : '#9a3412')
                    }}
                  >
                    {u.is_blocked ? 'Blocked' : (u.is_active ? 'Active' : 'Inactive')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatRelative(u.last_login || u.date_joined)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-1">
                    {['view', 'edit', u.is_active ? 'deactivate' : 'activate', u.is_blocked ? 'unblock' : 'block', 'delete'].map((action, index) => (
                      <button 
                        key={index}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100 transition-colors focus:outline-none"
                        title={getActionTitle(action)}
                        style={
                          {
                            color: getActionColor(action),
                          } as React.CSSProperties
                        }
                        onClick={() => {
                          onRowAction(u, action);
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
          <button
            type="button"
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={page <= 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
          >
            Previous
          </button>
          <button
            type="button"
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={page >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">
                {total === 0 ? 0 : (page - 1) * pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(page * pageSize, total)}
              </span>{' '}
              of <span className="font-medium">{total}</span> users
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px overflow-hidden">
              <button
                type="button"
                className="relative inline-flex items-center px-2.5 py-2.5 border border-gray-300 bg-white text-sm font-semibold text-gray-500 hover:bg-gray-50 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={page <= 1}
                onClick={() => onPageChange(Math.max(1, page - 1))}
                aria-label="Previous page"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              {getVisiblePages(page, totalPages).map((p, idx) => {
                if (p === '...') {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-semibold text-gray-500"
                    >
                      …
                    </span>
                  );
                }
                const active = p === page;
                return (
                  <button
                    key={p}
                    type="button"
                    className="relative inline-flex items-center px-4 py-2 border text-sm font-semibold focus:outline-none"
                    style={
                      active
                        ? { backgroundColor: 'var(--azul-ultramar)', borderColor: 'var(--azul-ultramar)', color: 'white' }
                        : { backgroundColor: 'white', borderColor: '#d1d5db', color: '#6b7280' }
                    }
                    onClick={() => onPageChange(p)}
                    aria-current={active ? 'page' : undefined}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                type="button"
                className="relative inline-flex items-center px-2.5 py-2.5 border border-gray-300 bg-white text-sm font-semibold text-gray-500 hover:bg-gray-50 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={page >= totalPages}
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                aria-label="Next page"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
