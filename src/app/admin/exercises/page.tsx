'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { withAdminAuth } from '../../../lib/AuthContext';
import ExerciseSectionCards from './components/ExerciseSectionCards';

function ExercisesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Floating shapes */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} activeItem="exercises" />

      <div className="lg:ml-64 flex flex-col flex-1">
        <Header 
          title="Exercise Management" 
          onToggleSidebar={() => setSidebarOpen(true)} 
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-6">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <ExerciseSectionCards />
          </div>
        </main>
      </div>

      
    </div>
  );
}

export default withAdminAuth(ExercisesPage);
