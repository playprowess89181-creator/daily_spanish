'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { withAdminAuth } from '../../../lib/AuthContext';
import ReportStatsCards from './components/ReportStatsCards';
import ReportsCharts from './components/ReportsCharts';
import PaymentTrendsChart from './components/PaymentTrendsChart';
import ReportsTables from './components/ReportsTables';

function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} activeItem="reports" />
      
      <div className="lg:ml-64 flex flex-col flex-1">
        <Header 
          title="Reports & Analytics" 
          onToggleSidebar={() => setSidebarOpen(true)} 
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <ReportStatsCards />
            <ReportsCharts />
            <PaymentTrendsChart />
            <ReportsTables />
          </div>
        </main>
      </div>

      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)}></div>
        </div>
      )}
    </div>
  );
}

export default withAdminAuth(ReportsPage);
