'use client';

export default function ReportStatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-600 bg-opacity-10">
            <i className="fas fa-globe text-blue-600 text-xl"></i>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Countries</p>
            <p className="text-2xl font-semibold text-gray-900">45</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-yellow-500 bg-opacity-10">
            <i className="fas fa-language text-yellow-500 text-xl"></i>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Languages</p>
            <p className="text-2xl font-semibold text-gray-900">12</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-orange-500 bg-opacity-10">
            <i className="fas fa-dollar-sign text-orange-500 text-xl"></i>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
            <p className="text-2xl font-semibold text-gray-900">$125,430</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-400 bg-opacity-10">
            <i className="fas fa-chart-line text-green-400 text-xl"></i>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Growth Rate</p>
            <p className="text-2xl font-semibold text-gray-900">+23.5%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

