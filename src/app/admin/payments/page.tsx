'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import PaymentStatsCards from './components/PaymentStatsCards';
import PaymentFilters from './components/PaymentFilters';
import PaymentTabs from './components/PaymentTabs';
import RevenueCharts from './components/RevenueCharts';
import BulkActions from './components/BulkActions';
import { withAdminAuth } from '../../../lib/AuthContext';

function PaymentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overdue');
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    planType: 'all',
    dateFrom: '',
    dateTo: ''
  });

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={handleToggleSidebar} activeItem="payments" />
      
      {/* Main Content */}
      <div className="lg:ml-64 flex flex-col flex-1">
        {/* Header */}
        <Header 
          title="Payments & Subscriptions"
          onToggleSidebar={handleToggleSidebar} 
        />
        
        {/* Payments Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {/* Payment Statistics */}
            <PaymentStatsCards />

            {/* Filters and Search */}
            <PaymentFilters filters={filters} onFilterChange={handleFilterChange} />

            {/* Payment Tabs */}
            <PaymentTabs 
              activeTab={activeTab} 
              onTabChange={handleTabChange} 
              filters={filters} 
            />
            
            {/* Revenue Charts */}
            <RevenueCharts />
            
            {/* Bulk Actions */}
            <BulkActions />

          </div>
        </main>
      </div>
    </div>
  );
}

export default withAdminAuth(PaymentsPage);
