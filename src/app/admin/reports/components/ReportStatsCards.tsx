'use client';

import type { ReportsAnalytics } from '../page';

export default function ReportStatsCards(props: { data: ReportsAnalytics | null; loading: boolean }) {
  const { data, loading } = props;
  const v = data?.users;
  const l = data?.lessons;
  const s = data?.support;

  const card = (opts: { title: string; value: string; icon: string; accent: string; sub?: string }) => (
    <div className="glass-effect rounded-2xl border border-white/20 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">{opts.title}</div>
          <div className="text-2xl font-extrabold text-gray-900 mt-1">{loading ? '—' : opts.value}</div>
          {opts.sub ? <div className="text-xs text-gray-500 mt-1">{opts.sub}</div> : null}
        </div>
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${opts.accent}`}>
          <i className={`${opts.icon} text-white text-lg`}></i>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {card({
        title: 'Total Users',
        value: String(v?.total ?? 0),
        icon: 'fas fa-users',
        accent: 'bg-gradient-to-br from-blue-600 to-indigo-600',
        sub: v ? `${v.active.toLocaleString()} active • ${v.blocked.toLocaleString()} blocked` : undefined,
      })}
      {card({
        title: 'Countries / Languages',
        value: v ? `${v.countries_count}/${v.languages_count}` : '0/0',
        icon: 'fas fa-globe',
        accent: 'bg-gradient-to-br from-emerald-500 to-teal-600',
        sub: v ? `${v.verified.toLocaleString()} verified • ${v.subscribed.toLocaleString()} subscribed` : undefined,
      })}
      {card({
        title: 'Lessons',
        value: String(l?.total ?? 0),
        icon: 'fas fa-book',
        accent: 'bg-gradient-to-br from-orange-500 to-rose-500',
        sub: l ? `${l.with_video_file + l.with_video_url} with video • ${l.with_lesson_pdf + l.with_keys_pdf} PDFs` : undefined,
      })}
      {card({
        title: 'Support Threads',
        value: String(s?.total ?? 0),
        icon: 'fas fa-life-ring',
        accent: 'bg-gradient-to-br from-purple-600 to-fuchsia-600',
        sub: s ? `${s.open.toLocaleString()} open • ${s.resolved.toLocaleString()} resolved` : undefined,
      })}
    </div>
  );
}
