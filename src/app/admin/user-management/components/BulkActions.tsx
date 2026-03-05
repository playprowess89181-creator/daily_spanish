'use client';

type BulkActionKey = 'activate' | 'deactivate' | 'block' | 'unblock';

type BulkActionsProps = {
  selectedCount: number;
  onAction?: (action: BulkActionKey) => void;
  onClearSelection?: () => void;
};

export default function BulkActions({ selectedCount, onAction, onClearSelection }: BulkActionsProps) {
  const bulkActions = [
    {
      key: 'activate' as const,
      text: 'Activate Selected',
      icon: 'fas fa-play',
      bgColor: 'var(--verde-menta)',
      textColor: '#374151'
    },
    {
      key: 'deactivate' as const,
      text: 'Deactivate Selected',
      icon: 'fas fa-pause',
      bgColor: 'var(--naranja)',
      textColor: 'white'
    },
    {
      key: 'block' as const,
      text: 'Block Selected',
      icon: 'fas fa-ban',
      bgColor: '#ef4444',
      textColor: 'white'
    },
    {
      key: 'unblock' as const,
      text: 'Unblock Selected',
      icon: 'fas fa-unlock',
      bgColor: 'var(--azul-ultramar)',
      textColor: 'white'
    }
  ];

  if (selectedCount <= 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
      <div className="px-5 sm:px-6 py-4 border-b border-gray-200 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-lg font-extrabold text-gray-900 tracking-tight">Bulk Actions</div>
          <div className="text-sm font-semibold text-gray-600">{selectedCount} selected</div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none"
          onClick={onClearSelection}
          disabled={!onClearSelection}
        >
          <i className="fas fa-xmark text-gray-500"></i>
          Clear
        </button>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap gap-3">
        {bulkActions.map((action, index) => (
          <button 
            key={index}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-extrabold shadow-sm transition hover:opacity-90 focus:outline-none"
            style={{
              backgroundColor: action.bgColor,
              color: action.textColor,
            } as React.CSSProperties}
            onClick={() => onAction?.(action.key)}
          >
            <i className={action.icon}></i>
            {action.text}
          </button>
        ))}
      </div>
      </div>
    </div>
  );
}
