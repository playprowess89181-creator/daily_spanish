'use client';

import type { ReportsAnalytics } from '../page';
import { BarList } from './InlineCharts';

export default function ReportsCharts(props: { data: ReportsAnalytics | null; loading: boolean }) {
  const { data, loading } = props;
  const countryRows = (data?.users.by_country || []).map((r) => ({ label: r.label, value: r.count }));
  const languageRows = (data?.users.by_language || []).map((r) => ({ label: r.label, value: r.count }));
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="glass-effect rounded-2xl border border-white/20 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Users by Country</h3>
          <div className="text-xs text-gray-500">Top locations</div>
        </div>
        {loading ? (
          <div className="text-sm text-gray-600">Loading…</div>
        ) : countryRows.length ? (
          <BarList rows={countryRows} colorClassName="bg-gradient-to-r from-blue-600 to-indigo-600" />
        ) : (
          <div className="text-sm text-gray-600">No data</div>
        )}
      </div>

      <div className="glass-effect rounded-2xl border border-white/20 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Native Languages</h3>
          <div className="text-xs text-gray-500">Top languages</div>
        </div>
        {loading ? (
          <div className="text-sm text-gray-600">Loading…</div>
        ) : languageRows.length ? (
          <BarList rows={languageRows} colorClassName="bg-gradient-to-r from-emerald-500 to-teal-600" />
        ) : (
          <div className="text-sm text-gray-600">No data</div>
        )}
      </div>
    </div>
  );
}
