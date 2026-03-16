'use client';

type Stats = {
  estimated_total_revenue_cents: number;
  estimated_mrr_cents: number;
  active_subscriptions: number;
  overdue_payments: number;
  subscribers_total: number;
};

function formatUSD(cents: number) {
  const v = Number(cents || 0) / 100;
  return v.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}

export default function PaymentStatsCards({ stats, loading }: { stats: Stats | null; loading: boolean }) {
  const cards = [
    {
      title: 'Estimated Revenue',
      value: stats ? formatUSD(stats.estimated_total_revenue_cents) : '—',
      icon: 'fas fa-dollar-sign',
      ring: 'ring-emerald-200',
      accent: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Subscribers',
      value: stats ? stats.subscribers_total.toLocaleString() : '—',
      icon: 'fas fa-users',
      ring: 'ring-blue-200',
      accent: 'from-blue-600 to-indigo-600',
    },
    {
      title: 'Active Subscriptions',
      value: stats ? stats.active_subscriptions.toLocaleString() : '—',
      icon: 'fas fa-credit-card',
      ring: 'ring-indigo-200',
      accent: 'from-indigo-600 to-purple-600',
    },
    {
      title: 'Overdue Accounts',
      value: stats ? stats.overdue_payments.toLocaleString() : '—',
      icon: 'fas fa-exclamation-triangle',
      ring: 'ring-orange-200',
      accent: 'from-orange-500 to-rose-500',
    },
    {
      title: 'Estimated MRR',
      value: stats ? formatUSD(stats.estimated_mrr_cents) : '—',
      icon: 'fas fa-chart-line',
      ring: 'ring-amber-200',
      accent: 'from-amber-500 to-yellow-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
      {cards.map((c) => (
        <div key={c.title} className={`glass-effect rounded-2xl border border-white/20 shadow-sm p-5 ring-1 ${c.ring}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-gray-600">{c.title}</div>
              <div className="mt-1 text-xl font-semibold text-gray-900">
                {loading ? <span className="text-gray-400">Loading…</span> : c.value}
              </div>
            </div>
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.accent} text-white flex items-center justify-center shadow-sm`}>
              <i className={c.icon}></i>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
