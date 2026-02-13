'use client';

interface PaymentTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  filters: any;
}

// Mock data for different tabs
const allTransactions = [
  {
    id: '#TXN-001234',
    user: 'John Smith',
    plan: 'Annual Premium',
    amount: '$299.00',
    status: 'Paid',
    date: '2024-01-15'
  }
];

const overduePayments = [
  {
    user: 'Maria Garcia',
    email: 'maria.garcia@email.com',
    plan: 'Monthly Basic',
    amount: '$29.99',
    dueDate: '2024-01-10',
    daysPastDue: '15 days'
  },
  {
    user: 'Robert Johnson',
    email: 'robert.j@email.com',
    plan: 'Quarterly Premium',
    amount: '$89.99',
    dueDate: '2024-01-05',
    daysPastDue: '20 days'
  }
];

const activeSubscriptions = [
  {
    user: 'John Smith',
    email: 'john.smith@email.com',
    plan: 'Annual Premium',
    amount: '$299.00',
    startDate: '2024-01-15',
    nextPayment: '2025-01-15',
    status: 'Active'
  }
];

function getStatusBadge(status: string) {
  const statusClasses = {
    'Paid': 'bg-green-100 text-green-800',
    'Active': 'bg-green-100 text-green-800',
    'Overdue': 'bg-red-100 text-red-800',
    'Cancelled': 'bg-gray-100 text-gray-800',
    'Refunded': 'bg-blue-100 text-blue-800'
  };

  const className = statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${className}`}>
      {status}
    </span>
  );
}

export default function PaymentTabs({ activeTab, onTabChange, filters }: PaymentTabsProps) {
  const tabs = [
    { id: 'all', name: 'All Transactions', count: allTransactions.length },
    { id: 'overdue', name: 'Overdue Payments', count: overduePayments.length },
    { id: 'subscriptions', name: 'Active Subscriptions', count: activeSubscriptions.length }
  ];

  const renderAllTransactions = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Transaction ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Plan
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {allTransactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {transaction.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {transaction.user}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {transaction.plan}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {transaction.amount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(transaction.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {transaction.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button className="text-ultramarine hover:text-blue-700 mr-3" title="Download Invoice">
                  <i className="fas fa-download"></i>
                </button>
                <button className="text-ochre hover:text-yellow-700" title="View Details">
                  <i className="fas fa-eye"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderOverduePayments = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Plan
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount Due
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Due Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Days Overdue
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {overduePayments.map((payment, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{payment.user}</div>
                <div className="text-sm text-gray-500">{payment.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {payment.plan}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {payment.amount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {payment.dueDate}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-medium text-red-600">
                  {payment.daysPastDue}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button className="text-ultramarine hover:text-blue-700 mr-3" title="Send Reminder">
                  <i className="fas fa-envelope"></i>
                </button>
                <button className="text-ochre hover:text-yellow-700" title="Extend Due Date">
                  <i className="fas fa-calendar-plus"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderActiveSubscriptions = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Plan
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Start Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Next Payment
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {activeSubscriptions.map((subscription, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{subscription.user}</div>
                <div className="text-sm text-gray-500">{subscription.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {subscription.plan}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {subscription.amount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {subscription.startDate}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {subscription.nextPayment}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(subscription.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button className="text-ultramarine hover:text-blue-700" title="Pause Subscription">
                  <i className="fas fa-pause"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'all':
        return renderAllTransactions();
      case 'overdue':
        return renderOverduePayments();
      case 'subscriptions':
        return renderActiveSubscriptions();
      default:
        return renderAllTransactions();
    }
  };

  return (
    <div className="bg-white shadow rounded-lg mb-8">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-current text-current'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              style={{
                color: activeTab === tab.id ? 'var(--azul-ultramar)' : undefined,
                borderColor: activeTab === tab.id ? 'var(--azul-ultramar)' : undefined
              }}
            >
              {tab.name}
              <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-gray-100 text-gray-900">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  );
}