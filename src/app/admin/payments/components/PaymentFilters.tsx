'use client';

interface PaymentFiltersProps {
  filters: {
    search: string;
    status: string;
    planType: string;
    dateFrom: string;
    dateTo: string;
  };
  onFilterChange: (filters: any) => void;
}

export default function PaymentFilters({ filters, onFilterChange }: PaymentFiltersProps) {
  const handleInputChange = (field: string, value: string) => {
    onFilterChange({ [field]: value });
  };

  const handleClearFilters = () => {
    onFilterChange({
      search: '',
      status: 'all',
      planType: 'all',
      dateFrom: '',
      dateTo: ''
    });
  };

  return (
    <div className="text-gray-900 p-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-600">Filters</div>
          <div className="text-base font-semibold text-gray-900">Search and narrow down results</div>
        </div>
        <button
          type="button"
          onClick={handleClearFilters}
          className="px-4 py-2 rounded-xl bg-white/70 border border-white/30 shadow-sm text-gray-800 hover:bg-white self-start lg:self-auto"
        >
          <i className="fas fa-eraser mr-2"></i>
          Clear
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-2">
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
              placeholder="Search by user name, email, or ID…"
            />
          </div>
        </div>

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
          </select>
        </div>

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
            <option value="yearly">Annual</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Joined From
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleInputChange('dateFrom', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-ultramarine focus:border-ultramarine"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Joined To
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleInputChange('dateTo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-ultramarine focus:border-ultramarine"
          />
        </div>
      </div>
    </div>
  );
}
