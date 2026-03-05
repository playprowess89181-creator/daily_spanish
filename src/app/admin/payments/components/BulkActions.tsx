'use client';

interface BulkAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  hoverColor: string;
  onClick: () => void;
}

export default function BulkActions() {
  const handleSendReminders = () => {
    console.log('Sending payment reminders...');
    // Implementation for sending payment reminders
  };

  const handleExtendDueDates = () => {
    console.log('Extending due dates...');
    // Implementation for extending due dates
  };

  const handleDownloadInvoices = () => {
    console.log('Downloading invoices...');
    // Implementation for downloading invoices
  };

  const handleExportReport = () => {
    console.log('Exporting financial report...');
    // Implementation for exporting financial report
  };

  const bulkActions: BulkAction[] = [
    {
      id: 'send-reminders',
      label: 'Send Payment Reminders',
      icon: 'fas fa-envelope',
      color: 'var(--naranja)',
      hoverColor: 'var(--naranja-hover)',
      onClick: handleSendReminders
    },
    {
      id: 'extend-dates',
      label: 'Extend Due Dates',
      icon: 'fas fa-calendar-plus',
      color: 'var(--azul-ultramar)',
      hoverColor: 'var(--azul-ultramar-hover)',
      onClick: handleExtendDueDates
    },
    {
      id: 'download-invoices',
      label: 'Download Invoices',
      icon: 'fas fa-download',
      color: 'var(--verde-menta)',
      hoverColor: 'var(--verde-menta-hover)',
      onClick: handleDownloadInvoices
    },
    {
      id: 'export-report',
      label: 'Export Financial Report',
      icon: 'fas fa-file-export',
      color: 'var(--amarillo-ocre)',
      hoverColor: 'var(--amarillo-ocre-hover)',
      onClick: handleExportReport
    }
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Bulk Actions</h3>
      <div className="flex flex-wrap gap-4">
        {bulkActions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="px-4 py-2 rounded-md text-white font-medium transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center"
            style={{
              backgroundColor: action.color,
              '--tw-ring-color': action.color
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = action.hoverColor;
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = action.color;
            }}
            onFocus={(e) => {
              e.target.style.setProperty('--tw-ring-color', action.color);
            }}
          >
            <i className={`${action.icon} mr-2`}></i>
            {action.label}
          </button>
        ))}
      </div>
      
      {/* Additional Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <i className="fas fa-info-circle text-blue-400 mt-0.5"></i>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-gray-900">Bulk Action Guidelines</h4>
            <div className="mt-2 text-sm text-gray-600">
              <ul className="list-disc list-inside space-y-1">
                <li>Payment reminders will be sent to users with overdue payments</li>
                <li>Due date extensions apply a 7-day grace period</li>
                <li>Invoice downloads include all transactions from the selected date range</li>
                <li>Financial reports contain detailed revenue and subscription analytics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}