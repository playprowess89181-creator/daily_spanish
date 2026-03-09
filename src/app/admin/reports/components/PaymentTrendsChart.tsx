'use client';

import type { ReportsAnalytics } from '../page';
import { MiniLineChart } from './InlineCharts';

export default function PaymentTrendsChart(props: { data: ReportsAnalytics | null; loading: boolean }) {
  const { data, loading } = props;
  const points = (data?.users.signups || []).map((p) => ({ x: p.date.slice(5), y: p.count }));

  return (
    <div className="glass-effect rounded-2xl border border-white/20 p-6 mb-8 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">User Signups</h3>
          <div className="text-sm text-gray-600">New accounts created per day</div>
        </div>
        <div className="text-xs text-gray-500">{data ? `Last ${data.window_days} days` : ''}</div>
      </div>
      {loading ? (
        <div className="text-sm text-gray-600">Loading…</div>
      ) : points.length ? (
        <MiniLineChart points={points} />
      ) : (
        <div className="text-sm text-gray-600">No data</div>
      )}
    </div>
  );
}
