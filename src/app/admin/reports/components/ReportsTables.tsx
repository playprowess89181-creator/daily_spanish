'use client';

export default function ReportsTables() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Countries by Users</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">🇺🇸 United States</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2,847</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">28.5%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">🇬🇧 United Kingdom</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1,923</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">19.2%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">🇨🇦 Canada</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1,456</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">14.6%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">🇦🇺 Australia</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">987</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">9.9%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">🇩🇪 Germany</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">743</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">7.4%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue by Country</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">🇺🇸 United States</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$45,230</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">+15.2%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">🇬🇧 United Kingdom</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$32,180</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">+12.8%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">🇨🇦 Canada</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$23,450</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">+18.5%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">🇦🇺 Australia</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$15,670</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">+9.3%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">🇩🇪 Germany</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$8,900</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">-2.1%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

