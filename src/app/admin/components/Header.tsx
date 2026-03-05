'use client';

import type { CSSProperties } from 'react';

interface HeaderProps {
  title?: string;
  onToggleSidebar: () => void;
  showAddButton?: boolean;
  addButtonText?: string;
  addButtonIcon?: string;
  onAddClick?: () => void;
}

export default function Header({ 
  title = "Dashboard", 
  onToggleSidebar, 
  showAddButton = false,
  addButtonText = "Add",
  addButtonIcon = "fas fa-plus",
  onAddClick
}: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-white shadow-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={
                {
                  backgroundColor: 'var(--azul-ultramar)',
                  '--tw-ring-color': 'var(--azul-ultramar)'
                } as CSSProperties
              }
              onClick={onToggleSidebar}
              aria-label="Open sidebar"
            >
              <i className="fas fa-bars"></i>
            </button>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight truncate">{title}</h2>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              {showAddButton && (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-white text-sm font-semibold shadow-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={
                    {
                      backgroundColor: 'var(--azul-ultramar)',
                      '--tw-ring-color': 'var(--azul-ultramar)'
                    } as CSSProperties
                  }
                  onClick={onAddClick}
                  disabled={!onAddClick}
                >
                  <i className={addButtonIcon}></i>
                  <span className="hidden sm:inline">{addButtonText}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <div className="h-9 w-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <i className="fas fa-user text-gray-500"></i>
                </div>
                <span className="hidden md:inline text-sm font-semibold text-gray-700">Admin User</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
