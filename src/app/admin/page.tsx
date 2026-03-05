'use client';

import { useState } from 'react';
import { withAdminAuth } from '../../lib/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import ChartsSection from './components/ChartsSection';
import UserLevelDistribution from './components/UserLevelDistribution';
import PaymentStatusTable from './components/PaymentStatusTable';

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} activeItem="dashboard" />
      
      {/* Main Content */}
      <div className="lg:ml-64 flex flex-col flex-1">
        <Header onToggleSidebar={toggleSidebar} />
        
        {/* Dashboard Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <StatsCards />
            <ChartsSection />
            <UserLevelDistribution />
            <PaymentStatusTable />
          </div>
        </main>
      </div>
    </div>
  );
}

export default withAdminAuth(AdminDashboard);
