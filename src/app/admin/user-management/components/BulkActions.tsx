'use client';

export default function BulkActions() {
  const bulkActions = [
    {
      text: 'Activate Selected',
      icon: 'fas fa-play',
      bgColor: 'var(--verde-menta)',
      textColor: '#374151',
      hoverColor: '#4ade80'
    },
    {
      text: 'Deactivate Selected',
      icon: 'fas fa-pause',
      bgColor: 'var(--naranja)',
      textColor: 'white',
      hoverColor: '#ea580c'
    },
    {
      text: 'Block Selected',
      icon: 'fas fa-ban',
      bgColor: '#ef4444',
      textColor: 'white',
      hoverColor: '#dc2626'
    },
    {
      text: 'Extend Payment',
      icon: 'fas fa-calendar-plus',
      bgColor: 'var(--ocre)',
      textColor: 'white',
      hoverColor: '#ca8a04'
    },
    {
      text: 'Send Notification',
      icon: 'fas fa-envelope',
      bgColor: 'var(--azul-ultramar)',
      textColor: 'white',
      hoverColor: '#1d4ed8'
    }
  ];

  return (
    <div className="mt-6 bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Bulk Actions</h3>
      <div className="flex flex-wrap gap-4">
        {bulkActions.map((action, index) => (
          <button 
            key={index}
            className="px-4 py-2 rounded-md transition-colors hover:opacity-90"
            style={{
              backgroundColor: action.bgColor,
              color: action.textColor
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = action.hoverColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = action.bgColor;
            }}
          >
            <i className={`${action.icon} mr-2`}></i>
            {action.text}
          </button>
        ))}
      </div>
    </div>
  );
}