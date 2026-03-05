'use client';

import { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { withAdminAuth } from '../../../../lib/AuthContext';

function DailyRoutinePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} activeItem="exercises" />

      <div className="lg:ml-64 flex flex-col flex-1">
        <Header title="Daily Routine" onToggleSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-6">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-700">Create and review daily routine exercises and content blocks.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default withAdminAuth(DailyRoutinePage);

