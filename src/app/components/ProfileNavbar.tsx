'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';

const ProfileNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout } = useAuth();
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const isProfile = pathname?.startsWith('/profile');
  const isPricing = pathname?.startsWith('/pricing');
  const isCart = pathname?.startsWith('/cart');
  const isProducts = pathname?.startsWith('/products');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <nav className="nav-glass fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-white" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>
                Daily Spanish
              </h1>
            </div>
          </div>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/dashboard" className={`${
              isDashboard
                ? 'text-yellow-300 px-4 transition-all transform hover:scale-105'
                : 'text-white hover:text-yellow-300 px-3 transition-colors'
            } py-2 text-sm font-medium duration-200`}>
              Dashboard
            </Link>
            <Link href="/products" className={`${
              isProducts
                ? 'text-yellow-300 px-4 transition-all transform hover:scale-105'
                : 'text-white hover:text-yellow-300 px-3 transition-colors'
            } py-2 text-sm font-medium duration-200`}>
              <span className="flex items-center">
                <i className="fas fa-store mr-2"></i>
                Products
              </span>
            </Link>
            <Link href="/pricing" className={`${
              isPricing
                ? 'text-yellow-300 px-4 transition-all transform hover:scale-105'
                : 'text-white hover:text-yellow-300 px-3 transition-colors'
            } py-2 text-sm font-medium duration-200`}>
              <span className="flex items-center">
                <i className="fas fa-tag mr-2"></i>
                Pricing
              </span>
            </Link>
            <Link href="/cart" className={`${
              isCart
                ? 'text-yellow-300 px-4 transition-all transform hover:scale-105'
                : 'text-white hover:text-yellow-300 px-3 transition-colors'
            } py-2 text-sm font-medium duration-200`}>
              <span className="flex items-center">
                <i className="fas fa-shopping-cart mr-2"></i>
                Cart
              </span>
            </Link>
            <Link href="/profile" className={`${
              isProfile
                ? 'text-yellow-300 px-4 transition-all transform hover:scale-105'
                : 'text-white hover:text-yellow-300 px-3 transition-colors'
            } py-2 text-sm font-medium duration-200`}>
              Profile
            </Link>
            <button onClick={handleSignOut} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105">
              Sign Out
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white hover:text-yellow-300 focus:outline-none focus:text-yellow-300 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/10 backdrop-blur-sm rounded-lg my-2">
              <Link href="/dashboard" className={`${
                isDashboard
                  ? 'text-yellow-300 block px-3 py-2 text-base font-medium transition-all duration-200'
                  : 'text-white hover:text-yellow-300 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200'
              }`}>
                Dashboard
              </Link>
              <Link href="/products" className={`${
                isProducts
                  ? 'text-yellow-300 block px-3 py-2 text-base font-medium transition-all duration-200'
                  : 'text-white hover:text-yellow-300 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200'
              }`}>
                <span className="flex items-center">
                  <i className="fas fa-store mr-3"></i>
                  Products
                </span>
              </Link>
              <Link href="/pricing" className={`${
                isPricing
                  ? 'text-yellow-300 block px-3 py-2 text-base font-medium transition-all duration-200'
                  : 'text-white hover:text-yellow-300 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200'
              }`}>
                <span className="flex items-center">
                  <i className="fas fa-tag mr-3"></i>
                  Pricing
                </span>
              </Link>
              <Link href="/cart" className={`${
                isCart
                  ? 'text-yellow-300 block px-3 py-2 text-base font-medium transition-all duration-200'
                  : 'text-white hover:text-yellow-300 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200'
              }`}>
                <span className="flex items-center">
                  <i className="fas fa-shopping-cart mr-3"></i>
                  Cart
                </span>
              </Link>
              <Link href="/profile" className={`${
                isProfile
                  ? 'text-yellow-300 block px-3 py-2 text-base font-medium transition-all duration-200'
                  : 'text-white hover:text-yellow-300 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200'
              }`}>
                Profile
              </Link>
              <button onClick={handleSignOut} className="bg-orange-500 hover:bg-orange-600 text-white block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 mt-2 w-full text-left">
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default ProfileNavbar;
