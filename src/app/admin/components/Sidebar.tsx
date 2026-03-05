'use client';

import Link from 'next/link';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeItem?: string;
}

const navigationItems = [
  { name: 'Dashboard', icon: 'fas fa-tachometer-alt', href: '/admin', key: 'dashboard' },
  { name: 'User Management', icon: 'fas fa-users', href: '/admin/user-management', key: 'user-management' },
  { name: 'Notifications', icon: 'fas fa-bell', href: '/admin/notifications', key: 'notifications' },
  { name: 'Payments & Subscriptions', icon: 'fas fa-credit-card', href: '/admin/payments', key: 'payments' },
  { name: 'Exams Management', icon: 'fas fa-clipboard-list', href: '/admin/exams', key: 'exams' },
  { name: 'Exercises Panel', icon: 'fas fa-dumbbell', href: '/admin/exercises', key: 'exercises' },
  { name: 'Lessons Management', icon: 'fas fa-book', href: '/admin/lessons', key: 'lessons' },
  { name: 'Reports & Analytics', icon: 'fas fa-chart-bar', href: '/admin/reports', key: 'reports' },
  { name: 'Support', icon: 'fas fa-life-ring', href: '/admin/support', key: 'support' },
  { name: 'Admin Profile', icon: 'fas fa-user-cog', href: '/admin/profile', key: 'profile' }
];

export default function Sidebar({ isOpen, onToggle, activeItem = 'dashboard' }: SidebarProps) {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--azul-ultramar)' }}
        id="sidebar"
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <div className="min-w-0">
            <div className="text-white font-extrabold text-lg tracking-tight truncate">Admin Panel</div>
            <div className="text-white/70 text-xs font-semibold truncate">Daily Spanish</div>
          </div>
          <button
            type="button"
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/10 text-white/90 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            onClick={onToggle}
            aria-label="Close sidebar"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = activeItem === item.key;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#2563eb] text-white shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-[#2563eb]'
                  }`}
                  onClick={() => {
                    if (isOpen) onToggle();
                  }}
                >
                  <span className="flex h-5 w-5 items-center justify-center flex-none">
                    <i className={`${item.icon} text-[14px]`}></i>
                  </span>
                  <span className="min-w-0 truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
      
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden" 
          onClick={onToggle}
        ></div>
      )}
    </>
  );
}
