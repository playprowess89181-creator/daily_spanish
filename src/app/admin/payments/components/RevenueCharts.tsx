'use client';

const monthlyRevenueData = [
  { month: 'Jan', amount: 45000, height: 120 },
  { month: 'Feb', amount: 52000, height: 140 },
  { month: 'Mar', amount: 61000, height: 160 },
  { month: 'Apr', amount: 68000, height: 180 },
  { month: 'May', amount: 75000, height: 200 }
];

const chartColors = [
  'var(--azul-ultramar)',
  'var(--amarillo-ocre)',
  'var(--naranja)',
  'var(--verde-menta)',
  'var(--rosa-palido)'
];

const subscriptionPlans = [
  {
    name: 'Monthly Basic ($29.99)',
    count: 2182,
    percentage: 35,
    color: 'var(--azul-ultramar)'
  },
  {
    name: 'Quarterly Premium ($89.99)',
    count: 1746,
    percentage: 28,
    color: 'var(--amarillo-ocre)'
  },
  {
    name: 'Annual Premium ($299.99)',
    count: 1559,
    percentage: 25,
    color: 'var(--naranja)'
  },
  {
    name: 'Lifetime Access ($999.99)',
    count: 747,
    percentage: 12,
    color: 'var(--verde-menta)'
  }
];

export default function RevenueCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Monthly Revenue Trend Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Revenue Trend</h3>
        <div className="h-64 flex items-end justify-between space-x-2">
          {monthlyRevenueData.map((data, index) => (
            <div key={data.month} className="flex flex-col items-center group">
              <div className="relative">
                <div
                  className="rounded-t transition-all duration-300 hover:opacity-80 cursor-pointer"
                  style={{
                    height: `${data.height}px`,
                    width: '30px',
                    backgroundColor: chartColors[index]
                  }}
                  title={`${data.month}: $${data.amount.toLocaleString()}`}
                ></div>
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  ${data.amount.toLocaleString()}
                </div>
              </div>
              <span className="text-xs text-gray-500 mt-2">{data.month}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Total Revenue: <span className="font-semibold text-gray-900">$301,000</span>
          </p>
        </div>
      </div>

      {/* Subscription Plans Distribution */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Plans Distribution</h3>
        <div className="space-y-4">
          {subscriptionPlans.map((plan, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex-1 pr-4">{plan.name}</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2 relative overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${plan.percentage}%`,
                      backgroundColor: plan.color
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-12 text-right">
                  {plan.count.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Active Subscriptions</span>
            <span className="text-lg font-bold text-gray-900">
              {subscriptionPlans.reduce((sum, plan) => sum + plan.count, 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">Monthly Recurring Revenue</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--verde-menta)' }}>
              $127,543.89
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}