'use client';

interface HeaderProps {
  title?: string;
  onToggleSidebar: () => void;
  showAddButton?: boolean;
  addButtonText?: string;
  addButtonIcon?: string;
  onAddClick?: () => void;
  showExportButton?: boolean;
}

export default function Header({ 
  title = "Dashboard", 
  onToggleSidebar, 
  showAddButton = false,
  addButtonText = "Add",
  addButtonIcon = "fas fa-plus",
  onAddClick,
  showExportButton = true
}: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button 
              className="lg:hidden p-2 rounded-md text-white" 
              style={{ backgroundColor: 'var(--azul-ultramar)' }}
              onClick={onToggleSidebar}
            >
              <i className="fas fa-bars"></i>
            </button>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          </div>
          <div className="flex items-center space-x-4">
            {showExportButton && (
              <button 
                className="px-4 py-2 rounded-md text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: 'var(--azul-ultramar)' }}
              >
                <i className="fas fa-download mr-2"></i>
                Export Report
              </button>
            )}
            <div className="relative">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <i className="fas fa-bell"></i>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                               <i className="fas fa-user text-gray-500"></i>
                             </div>
              <span className="text-sm font-medium text-gray-700">Admin User</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
