'use client';

export default function RecentNotifications() {
  const recentNotifications = [
    {
      id: 1,
      title: 'Course Update',
      message: 'New lesson available in Intermediate course',
      time: '2h ago',
      status: 'sent',
      recipients: '3,421 recipients'
    },
    {
      id: 2,
      title: 'Payment Reminder',
      message: 'Your subscription expires in 3 days',
      time: '1d ago',
      status: 'scheduled',
      recipients: '156 recipients'
    },
    {
      id: 3,
      title: 'System Maintenance',
      message: 'Scheduled maintenance on Sunday',
      time: '3d ago',
      status: 'draft',
      recipients: 'All users'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return 'inline-flex px-2 py-1 text-xs font-semibold rounded-full text-gray-800';
      case 'scheduled':
        return 'inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white';
      case 'draft':
        return 'inline-flex px-2 py-1 text-xs font-semibold rounded-full text-gray-800';
      default:
        return 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-800';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'sent':
        return { backgroundColor: 'var(--verde-menta)' };
      case 'scheduled':
        return { backgroundColor: 'var(--naranja)' };
      case 'draft':
        return { backgroundColor: 'var(--rosa-palido)' };
      default:
        return {};
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Notifications</h3>
      <div className="space-y-3">
        {recentNotifications.map((notification) => (
          <div key={notification.id} className="p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900">{notification.title}</span>
              <span className="text-xs text-gray-500">{notification.time}</span>
            </div>
            <p className="text-sm text-gray-600">{notification.message}</p>
            <div className="flex items-center mt-2">
              <span 
                className={getStatusBadge(notification.status)}
                style={getStatusStyle(notification.status)}
              >
                {getStatusText(notification.status)}
              </span>
              <span className="ml-2 text-xs text-gray-500">{notification.recipients}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}