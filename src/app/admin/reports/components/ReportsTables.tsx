'use client';

import type { ReportsAnalytics } from '../page';

function fmtDate(v: string | null) {
  if (!v) return '—';
  try {
    return new Date(v).toLocaleDateString();
  } catch {
    return String(v);
  }
}

export default function ReportsTables(props: { data: ReportsAnalytics | null; loading: boolean }) {
  const { data, loading } = props;
  const usersTotal = data?.users.total || 0;
  const countries = data?.users.by_country || [];
  const levels = data?.users.by_level || [];
  const lessonsByBlock = data?.lessons.by_block;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-6 glass-effect rounded-2xl border border-white/20 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Top Countries by Users</h3>
          <div className="text-xs text-gray-500">Share of total</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Country</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Users</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">%</th>
              </tr>
            </thead>
            <tbody className="bg-white/60 divide-y divide-gray-100">
              {loading ? (
                <tr><td className="px-4 py-4 text-sm text-gray-600" colSpan={3}>Loading…</td></tr>
              ) : countries.length ? (
                countries.slice(0, 8).map((c) => (
                  <tr key={c.key} className="hover:bg-white/80">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{c.label}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">{c.count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">
                      {usersTotal ? `${((c.count / usersTotal) * 100).toFixed(1)}%` : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td className="px-4 py-4 text-sm text-gray-600" colSpan={3}>No data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lg:col-span-6 glass-effect rounded-2xl border border-white/20 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">User Levels</h3>
          <div className="text-xs text-gray-500">Distribution</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Level</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Users</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">%</th>
              </tr>
            </thead>
            <tbody className="bg-white/60 divide-y divide-gray-100">
              {loading ? (
                <tr><td className="px-4 py-4 text-sm text-gray-600" colSpan={3}>Loading…</td></tr>
              ) : levels.length ? (
                levels.slice(0, 8).map((c) => (
                  <tr key={c.key} className="hover:bg-white/80">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{c.label}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">{c.count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">
                      {usersTotal ? `${((c.count / usersTotal) * 100).toFixed(1)}%` : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td className="px-4 py-4 text-sm text-gray-600" colSpan={3}>No data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lg:col-span-7 glass-effect rounded-2xl border border-white/20 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
          <div className="text-xs text-gray-500">Last 12 signups</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Country</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Level</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="bg-white/60 divide-y divide-gray-100">
              {loading ? (
                <tr><td className="px-4 py-4 text-sm text-gray-600" colSpan={4}>Loading…</td></tr>
              ) : data?.recent_users?.length ? (
                data.recent_users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/80">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{u.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{u.country || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{u.level || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">{fmtDate(u.date_joined)}</td>
                  </tr>
                ))
              ) : (
                <tr><td className="px-4 py-4 text-sm text-gray-600" colSpan={4}>No data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lg:col-span-5 glass-effect rounded-2xl border border-white/20 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Lessons by Level</h3>
          <div className="text-xs text-gray-500">Inventory</div>
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="text-sm text-gray-600">Loading…</div>
          ) : lessonsByBlock ? (
            (Object.keys(lessonsByBlock) as Array<keyof typeof lessonsByBlock>).map((k) => (
              <div key={k} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white/60 px-4 py-3">
                <div className="text-sm font-semibold text-gray-900">{k}</div>
                <div className="text-sm font-extrabold text-gray-900">{lessonsByBlock[k].toLocaleString()}</div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-600">No data</div>
          )}
        </div>
      </div>
    </div>
  );
}
