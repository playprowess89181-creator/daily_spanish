'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ExamStatCard from './components/ExamStatCard';
import ExamFilters from './components/ExamFilters';
import ExamTable from './components/ExamTable';
import CreateExamModal from './components/CreateExamModal';
import ExamAnalytics from './components/ExamAnalytics';
import BulkActions from './components/BulkActions';
import { withAdminAuth } from '../../../lib/AuthContext';

function ExamsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedExams, setSelectedExams] = useState<number[]>([]);

  // Sample exam data matching the HTML structure
  const exams = [
    {
      id: 1,
      title: 'Spanish Grammar Basics',
      createdDate: '2024-01-15',
      subject: 'Grammar',
      level: 'Beginner',
      questions: 25,
      duration: '45 min',
      participants: 150,
      completionRate: '85%',
      status: 'Active' as const
    },
    {
      id: 2,
      title: 'Vocabulary Test A1',
      createdDate: '2024-01-12',
      subject: 'Vocabulary',
      level: 'Beginner',
      questions: 30,
      duration: '30 min',
      participants: 200,
      completionRate: '72%',
      status: 'Draft' as const
    },
    {
      id: 3,
      title: 'Listening Comprehension B1',
      createdDate: '2024-01-10',
      subject: 'Listening',
      level: 'Intermediate',
      questions: 20,
      duration: '60 min',
      participants: 120,
      completionRate: '90%',
      status: 'Active' as const
    },
    {
      id: 4,
      title: 'Advanced Spanish Literature',
      createdDate: '2024-01-08',
      subject: 'Reading',
      level: 'Advanced',
      questions: 35,
      duration: '90 min',
      participants: 45,
      completionRate: '68%',
      status: 'Archived' as const
    },
    {
      id: 5,
      title: 'Spanish Pronunciation Practice',
      createdDate: '2024-01-05',
      subject: 'Speaking',
      level: 'Intermediate',
      questions: 15,
      duration: '40 min',
      participants: 89,
      completionRate: '78%',
      status: 'Active' as const
    }
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const openCreateExamModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateExamModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateExam = (examData: any) => {
    console.log('Creating exam:', examData);
    // Handle exam creation logic here
  };

  const handleEditExam = (id: number) => {
    console.log('Editing exam:', id);
    // Handle exam editing logic here
  };

  const handleDeleteExam = (id: number) => {
    console.log('Deleting exam:', id);
    // Handle exam deletion logic here
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} for exams:`, selectedExams);
    // Handle bulk actions here
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} activeItem="exams" />
      
      {/* Main Content */}
      <div className="lg:ml-64 flex flex-col flex-1">
        <Header 
          title="Exams Management" 
          onToggleSidebar={toggleSidebar}
          showAddButton={true}
          onAddClick={openCreateExamModal}
          addButtonText="Create New Exam"
        />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <ExamStatCard 
                icon="fas fa-file-alt"
                iconColor="text-blue-600"
                title="Total Exams"
                value="127"
                bgColor="bg-blue-50"
              />
              <ExamStatCard 
                icon="fas fa-users"
                iconColor="text-green-600"
                title="Total Participants"
                value="2,847"
                bgColor="bg-green-50"
              />
              <ExamStatCard 
                icon="fas fa-chart-line"
                iconColor="text-yellow-600"
                title="Average Score"
                value="78.5%"
                bgColor="bg-yellow-50"
              />
              <ExamStatCard 
                icon="fas fa-clock"
                iconColor="text-purple-600"
                title="Active Exams"
                value="23"
                bgColor="bg-purple-50"
              />
            </div>

            {/* Filters */}
            <ExamFilters 
              searchTerm={searchTerm}
              selectedLevel={selectedLevel}
              selectedSubject={selectedSubject}
              selectedStatus={selectedStatus}
              onSearchChange={setSearchTerm}
              onLevelChange={setSelectedLevel}
              onSubjectChange={setSelectedSubject}
              onStatusChange={setSelectedStatus}
            />

            {/* Exam Table */}
            <div className="mb-6">
              <ExamTable 
                exams={exams}
                onEdit={handleEditExam}
                onDelete={handleDeleteExam}
              />
            </div>

            {/* Exam Analytics */}
            <ExamAnalytics />

            {/* Bulk Actions */}
            <BulkActions 
              selectedCount={selectedExams.length}
              onExportSelected={() => handleBulkAction('export')}
              onArchiveSelected={() => handleBulkAction('archive')}
              onDeleteSelected={() => handleBulkAction('delete')}
              onDuplicateSelected={() => handleBulkAction('duplicate')}
              onAssignUsers={() => handleBulkAction('assign')}
            />
          </div>
        </main>
      </div>

      {/* Create Exam Modal */}
      <CreateExamModal 
        isOpen={isCreateModalOpen}
        onClose={closeCreateExamModal}
        onSubmit={handleCreateExam}
      />
    </div>
  );
}

export default withAdminAuth(ExamsPage);
