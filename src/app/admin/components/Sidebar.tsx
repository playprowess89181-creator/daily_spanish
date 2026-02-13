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
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`} 
        style={{ backgroundColor: 'var(--azul-ultramar)' }}
        id="sidebar"
      >
        <div className="flex items-center justify-center h-20 shadow-md">
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        </div>
        <nav className="mt-10 flex-1 overflow-y-auto px-2">
          {navigationItems.map((item, index) => {
            const isActive = activeItem === item.key;
            return (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center mt-4 py-2 px-4 mx-2 rounded transition-colors duration-200 ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
                style={{
                  backgroundColor: isActive ? '#2563eb' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <i className={`${item.icon} mr-3`}></i>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
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
