'use client';

export default function ReportsCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Users by Country</h3>
        <div className="relative h-80">
          <canvas id="countryChart"></canvas>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Language Distribution</h3>
        <div className="relative h-80">
          <canvas id="languageChart"></canvas>
        </div>
      </div>
    </div>
  );
}

