'use client';

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: string;
  bgColor: string;
}

const stats = [
  {
    title: 'Total Revenue',
    value: '$284,750',
    icon: 'fas fa-dollar-sign',
    iconColor: 'var(--verde-menta)'
  },
  {
    title: 'Active Subscriptions',
    value: '6,234',
    icon: 'fas fa-credit-card',
    iconColor: 'var(--azul-ultramar)'
  },
  {
    title: 'Overdue Payments',
    value: '156',
    icon: 'fas fa-exclamation-triangle',
    iconColor: 'var(--naranja)'
  },
  {
    title: 'Monthly Growth',
    value: '+12.5%',
    icon: 'fas fa-chart-line',
    iconColor: 'var(--amarillo-ocre)'
  }
];

export default function PaymentStatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i 
                  className={`${stat.icon} text-2xl`}
                  style={{ color: stat.iconColor }}
                ></i>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.title}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}