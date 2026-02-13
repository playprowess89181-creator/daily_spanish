'use client';

export default function SearchFilters() {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
          <div className="relative">
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Search by name, email..."
              style={{
                '--tw-ring-color': 'var(--azul-ultramar)',
                borderColor: 'var(--border-gray)'
              } as React.CSSProperties}
            />
            <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
          <select 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            style={{
              '--tw-ring-color': 'var(--azul-ultramar)',
              borderColor: 'var(--border-gray)'
            } as React.CSSProperties}
          >
            <option>All Countries</option>
            <option>United States</option>
            <option>United Kingdom</option>
            <option>Canada</option>
            <option>Australia</option>
            <option>Germany</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
          <select 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            style={{
              '--tw-ring-color': 'var(--azul-ultramar)',
              borderColor: 'var(--border-gray)'
            } as React.CSSProperties}
          >
            <option>All Levels</option>
            <option>Beginner</option>
            <option>Elementary</option>
            <option>Intermediate</option>
            <option>Upper-Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            style={{
              '--tw-ring-color': 'var(--azul-ultramar)',
              borderColor: 'var(--border-gray)'
            } as React.CSSProperties}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Blocked</option>
            <option>Payment Overdue</option>
          </select>
        </div>
      </div>
    </div>
  );
}