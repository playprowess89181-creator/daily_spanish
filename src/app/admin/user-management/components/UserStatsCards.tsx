'use client';

type UserStatsCardsProps = {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  blockedUsers: number;
};

export default function UserStatsCards({ totalUsers, activeUsers, inactiveUsers, blockedUsers }: UserStatsCardsProps) {
  const statsData = [
    {
      title: 'Total Users',
      value: totalUsers.toLocaleString(),
      icon: 'fas fa-users',
      iconColor: 'var(--azul-ultramar)'
    },
    {
      title: 'Active Users',
      value: activeUsers.toLocaleString(),
      icon: 'fas fa-user-check',
      iconColor: 'var(--verde-menta)'
    },
    {
      title: 'Inactive Users',
      value: inactiveUsers.toLocaleString(),
      icon: 'fas fa-user-times',
      iconColor: 'var(--naranja)'
    },
    {
      title: 'Blocked Users',
      value: blockedUsers.toLocaleString(),
      icon: 'fas fa-user-slash',
      iconColor: '#ef4444'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
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
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                  <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
