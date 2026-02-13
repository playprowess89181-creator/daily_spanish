interface BulkActionsProps {
  selectedCount: number;
  onExportSelected: () => void;
  onArchiveSelected: () => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onAssignUsers: () => void;
}

export default function BulkActions({
  selectedCount,
  onExportSelected,
  onArchiveSelected,
  onDeleteSelected,
  onDuplicateSelected,
  onAssignUsers
}: BulkActionsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Bulk Actions</h4>
      <div className="flex flex-wrap gap-3">
        <button 
          onClick={onExportSelected}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <i className="fas fa-download mr-2"></i>
          Export Selected
        </button>
        <button 
          onClick={onArchiveSelected}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors flex items-center"
        >
          <i className="fas fa-archive mr-2"></i>
          Archive Selected
        </button>
        <button 
          onClick={onDeleteSelected}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
        >
          <i className="fas fa-trash mr-2"></i>
          Delete Selected
        </button>
        <button 
          onClick={onDuplicateSelected}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
        >
          <i className="fas fa-copy mr-2"></i>
          Duplicate Selected
        </button>
        <button 
          onClick={onAssignUsers}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
        >
          <i className="fas fa-users mr-2"></i>
          Assign to Users
        </button>
      </div>
      {selectedCount > 0 && (
        <p className="text-sm text-gray-600 mt-3">
          {selectedCount} exam{selectedCount !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}