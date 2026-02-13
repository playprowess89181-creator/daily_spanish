'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SearchFilters from './components/SearchFilters';
import UserStatsCards from './components/UserStatsCards';
import UsersTable from './components/UsersTable';
import BulkActions from './components/BulkActions';
import { withAdminAuth } from '../../../lib/AuthContext';

function UserManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} activeItem="user-management" />
      
      {/* Main Content */}
      <div className="lg:ml-64 flex flex-col flex-1">
        <Header 
          title="User Management" 
          onToggleSidebar={toggleSidebar}
          showAddButton={true}
          addButtonText="Add User"
          addButtonIcon="fas fa-plus"
        />
        
        {/* User Management Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {/* Search and Filters */}
            <SearchFilters />
            
            {/* User Statistics Cards */}
            <UserStatsCards />
            
            {/* Users Table */}
            <UsersTable />
            
            {/* Bulk Actions */}
            <BulkActions />
          </div>
        </main>
      </div>
    </div>
  );
}

export default withAdminAuth(UserManagement);
