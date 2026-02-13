'use client';

import { useState } from 'react';
import Link from 'next/link';
import VocabularyStatsCards from './components/VocabularyStatsCards';
import VocabularyExercisesList from './components/VocabularyExercisesList';
import ImageUploadPanel from './components/ImageUploadPanel';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { withAdminAuth } from '../../../../lib/AuthContext';

function VocabularyPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'exercises' | 'images'>('exercises');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        
      </div>

      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} activeItem="exercises" />

      <div className="lg:ml-64 flex flex-col flex-1">
        <Header title="Vocabulary" onToggleSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-6">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <VocabularyStatsCards />
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('exercises')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'exercises' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  Exercises
                </button>
                <button
                  onClick={() => setActiveTab('images')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'images' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  Images
                </button>
              </div>
              {activeTab === 'exercises' && (
                <Link 
                  href="/admin/exercises/vocabulary/create"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  aria-label="Create new vocabulary exercise"
                >
                  + Create New
                </Link>
              )}
            </div>
            {activeTab === 'exercises' ? (
              <VocabularyExercisesList />
            ) : (
              <ImageUploadPanel />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default withAdminAuth(VocabularyPage);
