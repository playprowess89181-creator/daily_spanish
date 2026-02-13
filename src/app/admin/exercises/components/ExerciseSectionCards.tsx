'use client';

import Link from 'next/link';

const cards = [
  {
    title: 'Vocabulary',
    href: '/admin/exercises/vocabulary',
    accent: 'from-yellow-400 via-amber-500 to-orange-500',
    badge: 'from-yellow-400 to-amber-500',
    icon: 'fas fa-language',
    description: 'Manage vocabulary exercises and materials.'
  },
  {
    title: 'Daily Routine',
    href: '/admin/exercises/daily-routine',
    accent: 'from-blue-400 via-indigo-500 to-violet-600',
    badge: 'from-blue-500 to-indigo-600',
    icon: 'fas fa-calendar-day',
    description: 'Create and review daily routine content.'
  },
  {
    title: 'Verbs',
    href: '/admin/exercises/verbs',
    accent: 'from-emerald-400 via-green-500 to-teal-600',
    badge: 'from-emerald-500 to-green-600',
    icon: 'fas fa-pen-nib',
    description: 'Manage verb exercises and conjugations.'
  },
  {
    title: 'Tables',
    href: '/admin/exercises/tables',
    accent: 'from-fuchsia-500 via-purple-600 to-violet-700',
    badge: 'from-fuchsia-600 to-purple-700',
    icon: 'fas fa-table',
    description: 'Upload and organize tables and data.'
  }
];

export default function ExerciseSectionCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((c) => (
        <Link key={c.href} href={c.href} className="group block" aria-label={`Go to ${c.title} section`}>
          <div className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${c.accent}`} />
            <div className="p-6">
              <div className="flex items-center">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${c.badge} text-white flex items-center justify-center shadow-md`}>
                  <i className={`${c.icon} text-lg`}></i>
                </div>
                <div className="ml-4">
                  <p className="text-xs font-semibold tracking-wide text-gray-500">Section</p>
                  <p className="text-xl font-bold text-gray-900">{c.title}</p>
                </div>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <i className="fas fa-arrow-right text-gray-400 group-hover:text-gray-700"></i>
                </div>
              </div>
              <p className="text-gray-600 mt-4 text-sm">{c.description}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

