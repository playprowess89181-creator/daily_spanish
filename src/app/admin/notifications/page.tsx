'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import NotificationForm from './components/NotificationForm';
import TargetAudienceFilters from './components/TargetAudienceFilters';
import RecentNotifications from './components/RecentNotifications';
import { withAdminAuth } from '../../../lib/AuthContext';

function NotificationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          activeItem="notifications"
        />
      
      <div className="lg:ml-64 flex flex-col flex-1">
        <Header 
          title="Notifications Panel"
          onToggleSidebar={() => setSidebarOpen(true)}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Create Notification Form */}
              <div className="lg:col-span-2">
                <NotificationForm />
              </div>

              {/* Filters and Recent Notifications */}
              <div className="space-y-6">
                <TargetAudienceFilters />
                <RecentNotifications />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default withAdminAuth(NotificationsPage);
