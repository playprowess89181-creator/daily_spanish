'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="nav-glass fixed top-0 left-0 right-0 z-50">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Daily Spanish
              </h1>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link href="/login" className={`py-2 text-sm font-medium duration-200 ${
              pathname === '/login' 
                ? 'bg-orange-500 hover:bg-orange-600 text-white px-4 rounded-lg transition-all transform hover:scale-105' 
                : 'text-white hover:text-yellow-300 px-3 rounded-md transition-colors'
            }`}>
              Sign In
            </Link>
            <Link href="/register" className={`py-2 text-sm font-medium duration-200 ${
              pathname === '/register' 
                ? 'bg-orange-500 hover:bg-orange-600 text-white px-4 rounded-lg transition-all transform hover:scale-105' 
                : 'text-white hover:text-yellow-300 px-3 rounded-md transition-colors'
            }`}>
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
