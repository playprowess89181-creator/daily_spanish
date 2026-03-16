'use client';

type PlanBreakdown = { monthly: number; yearly: number };
type Stats = { estimated_total_revenue_cents: number; estimated_mrr_cents: number; active_subscriptions: number; overdue_payments: number; subscribers_total: number };

function formatUSD(cents: number) {
  const v = Number(cents || 0) / 100;
  return v.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}

export default function RevenueCharts({
  planBreakdown,
  stats,
  loading,
}: {
  planBreakdown: PlanBreakdown | null;
  stats: Stats | null;
  loading: boolean;
}) {
  const monthly = planBreakdown?.monthly || 0;
  const yearly = planBreakdown?.yearly || 0;
  const total = monthly + yearly;
  const monthlyPct = total ? Math.round((monthly / total) * 100) : 0;
  const yearlyPct = total ? Math.round((yearly / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="glass-effect rounded-2xl border border-white/20 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Revenue Snapshot</h3>
            <div className="text-sm text-gray-600 mt-1">Derived from current subscriber plan mix</div>
          </div>
          <div className="text-xs text-gray-500">Estimates</div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/70 border border-white/30 p-4">
            <div className="text-xs font-semibold text-gray-600">Estimated Total Revenue</div>
            <div className="mt-1 text-xl font-semibold text-gray-900">{loading || !stats ? '—' : formatUSD(stats.estimated_total_revenue_cents)}</div>
          </div>
          <div className="rounded-xl bg-white/70 border border-white/30 p-4">
            <div className="text-xs font-semibold text-gray-600">Estimated MRR</div>
            <div className="mt-1 text-xl font-semibold text-gray-900">{loading || !stats ? '—' : formatUSD(stats.estimated_mrr_cents)}</div>
          </div>
          <div className="rounded-xl bg-white/70 border border-white/30 p-4">
            <div className="text-xs font-semibold text-gray-600">Active Subscriptions</div>
            <div className="mt-1 text-xl font-semibold text-gray-900">{loading || !stats ? '—' : stats.active_subscriptions.toLocaleString()}</div>
          </div>
          <div className="rounded-xl bg-white/70 border border-white/30 p-4">
            <div className="text-xs font-semibold text-gray-600">Overdue Accounts</div>
            <div className="mt-1 text-xl font-semibold text-gray-900">{loading || !stats ? '—' : stats.overdue_payments.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="glass-effect rounded-2xl border border-white/20 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Plan Distribution</h3>
            <div className="text-sm text-gray-600 mt-1">Monthly vs annual subscribers</div>
          </div>
          <div className="text-xs text-gray-500">{loading ? 'Loading…' : `${total.toLocaleString()} total`}</div>
        </div>

        <div className="mt-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-800">Monthly</div>
                <div className="text-sm text-gray-600">{loading ? '—' : `${monthly.toLocaleString()} (${monthlyPct}%)`}</div>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600" style={{ width: `${monthlyPct}%` }}></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-800">Annual</div>
                <div className="text-sm text-gray-600">{loading ? '—' : `${yearly.toLocaleString()} (${yearlyPct}%)`}</div>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-rose-500" style={{ width: `${yearlyPct}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
