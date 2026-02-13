'use client';

interface PaymentFiltersProps {
  filters: {
    search: string;
    status: string;
    planType: string;
    dateFrom: string;
  };
  onFilterChange: (filters: any) => void;
}

export default function PaymentFilters({ filters, onFilterChange }: PaymentFiltersProps) {
  const handleInputChange = (field: string, value: string) => {
    onFilterChange({ [field]: value });
  };

  const handleApplyFilters = () => {
    // Apply filters logic here
    console.log('Applying filters:', filters);
  };

  const handleClearFilters = () => {
    onFilterChange({
      search: '',
      status: 'all',
      planType: 'all',
      dateFrom: ''
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Search Input */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-gray-400"></i>
            </div>
            <input
              type="text"
              id="search"
              value={filters.search}
              onChange={(e) => handleInputChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-ultramarine focus:border-ultramarine"
              placeholder="Search transactions..."
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-ultramarine focus:border-ultramarine"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Plan Type Filter */}
        <div>
          <label htmlFor="planType" className="block text-sm font-medium text-gray-700 mb-2">
            Plan Type
          </label>
          <select
            id="planType"
            value={filters.planType}
            onChange={(e) => handleInputChange('planType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-ultramarine focus:border-ultramarine"
          >
            <option value="all">All Plans</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annual">Annual</option>
            <option value="lifetime">Lifetime</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleInputChange('dateFrom', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-ultramarine focus:border-ultramarine"
          />
        </div>
      </div>

        {/* Apply Filters Button */}
        <div className="flex items-end">
          <button
            onClick={handleApplyFilters}
            className="w-full bg-ultramarine text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-filter mr-2"></i>
            Apply Filters
          </button>
        </div>
    </div>
  );
}