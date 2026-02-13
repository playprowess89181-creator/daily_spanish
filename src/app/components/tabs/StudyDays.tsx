'use client';

import React, { useState } from 'react';

interface StudySession {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'grammar' | 'conversation' | 'vocabulary' | 'reading' | 'writing';
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onSave: (session: Omit<StudySession, 'id'>) => void;
}

function ScheduleModal({ isOpen, onClose, selectedDate, onSave }: ScheduleModalProps) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('14:00');
  const [type, setType] = useState<'grammar' | 'conversation' | 'vocabulary' | 'reading' | 'writing'>('vocabulary');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !title.trim()) return;

    onSave({
      title: title.trim(),
      date: selectedDate.toISOString().split('T')[0],
      time,
      type
    });

    // Reset form
    setTitle('');
    setTime('14:00');
    setType('vocabulary');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Schedule Study Session</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              type="text" 
              value={selectedDate?.toLocaleDateString() || ''} 
              disabled 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Spanish Grammar Review"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input 
              type="time" 
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value as StudySession['type'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="grammar">Grammar</option>
              <option value="conversation">Conversation</option>
              <option value="vocabulary">Vocabulary</option>
              <option value="reading">Reading</option>
              <option value="writing">Writing</option>
            </select>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg hover:from-orange-500 hover:to-red-600 transition-all duration-200"
            >
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StudyDays() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studySessions, setStudySessions] = useState<StudySession[]>([
    {
      id: '1',
      title: 'Spanish Grammar Review',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      time: '14:00',
      type: 'grammar'
    },
    {
      id: '2',
      title: 'Conversation Practice',
      date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0], // 4 days from now
      time: '16:00',
      type: 'conversation'
    }
  ]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    setIsModalOpen(true);
  };

  const handleSaveSession = (sessionData: Omit<StudySession, 'id'>) => {
    const newSession: StudySession = {
      ...sessionData,
      id: Date.now().toString()
    };
    setStudySessions(prev => [...prev, newSession]);
  };

  const getSessionsForDate = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString().split('T')[0];
    return studySessions.filter(session => session.date === dateStr);
  };

  const getSessionTypeColor = (type: StudySession['type']) => {
    const colors = {
      grammar: 'bg-blue-100 border-blue-300',
      conversation: 'bg-green-100 border-green-300',
      vocabulary: 'bg-purple-100 border-purple-300',
      reading: 'bg-orange-100 border-orange-300',
      writing: 'bg-pink-100 border-pink-300'
    };
    return colors[type];
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = new Date();
    const isCurrentMonth = currentDate.getMonth() === today.getMonth() && 
                          currentDate.getFullYear() === today.getFullYear();

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="text-center py-2 text-gray-400"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const sessionsForDay = getSessionsForDate(day);
      const isToday = isCurrentMonth && day === today.getDate();
      const isPastDate = currentDate < today && day < today.getDate();
      
      days.push(
        <div 
          key={day} 
          onClick={() => !isPastDate && handleDateClick(day)}
          className={`text-center py-2 cursor-pointer rounded-lg transition-all duration-200 relative ${
            isToday 
              ? 'bg-orange-100 border-2 border-orange-300 text-orange-800 font-bold' 
              : isPastDate
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-800 hover:bg-gray-100'
          } ${
            sessionsForDay.length > 0 && !isPastDate ? 'bg-blue-50 border border-blue-200' : ''
          }`}
        >
          <span className="block">{day}</span>
          {sessionsForDay.length > 0 && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {sessionsForDay.slice(0, 3).map((session, index) => (
                <div 
                  key={session.id} 
                  className="w-1.5 h-1.5 rounded-full bg-orange-500"
                  title={session.title}
                ></div>
              ))}
              {sessionsForDay.length > 3 && (
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400" title={`+${sessionsForDay.length - 3} more`}></div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div>
      <h3 className="text-2xl font-bold gradient-text mb-6" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
        Study Days
      </h3>
      
      {/* Study Time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-effect rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-orange-400 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Study Time</p>
              <p className="text-2xl font-bold gradient-text">47.5 hrs</p>
            </div>
          </div>
        </div>
        
        <div className="glass-effect rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold gradient-text">8.2 hrs</p>
            </div>
          </div>
        </div>
        
        <div className="glass-effect rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Study Streak</p>
              <p className="text-2xl font-bold gradient-text">12 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="glass-effect rounded-xl p-6 border border-white/20 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-xl font-bold text-gray-800">Study Schedule</h4>
          <button 
            onClick={() => {
              setSelectedDate(new Date());
              setIsModalOpen(true);
            }}
            className="btn-ochre text-white px-4 py-2 rounded-lg font-medium text-sm hover:shadow-lg transition-all duration-300"
          >
            <span className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Schedule Session
            </span>
          </button>
        </div>
        
        {/* Interactive Calendar */}
        <div className="calendar-container">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h5 className="text-lg font-semibold text-gray-800">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h5>
            <button 
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            <div className="text-center text-sm font-medium text-gray-500 py-2">Sun</div>
            <div className="text-center text-sm font-medium text-gray-500 py-2">Mon</div>
            <div className="text-center text-sm font-medium text-gray-500 py-2">Tue</div>
            <div className="text-center text-sm font-medium text-gray-500 py-2">Wed</div>
            <div className="text-center text-sm font-medium text-gray-500 py-2">Thu</div>
            <div className="text-center text-sm font-medium text-gray-500 py-2">Fri</div>
            <div className="text-center text-sm font-medium text-gray-500 py-2">Sat</div>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p className="flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
              Click on any date to schedule a study session
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Study Sessions */}
      <div className="glass-effect rounded-xl p-6 border border-white/20">
        <h4 className="text-xl font-bold text-gray-800 mb-4">Upcoming Study Sessions</h4>
        <div className="space-y-3" id="upcomingSessions">
          {studySessions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No study sessions scheduled. Click on a calendar date to add one!</p>
          ) : (
             studySessions
               .filter(session => {
                 const sessionDate = new Date(session.date + ' ' + session.time);
                 const now = new Date();
                 return sessionDate >= now;
               })
               .sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime())
               .map((session) => {
                 const typeColors = {
                   vocabulary: 'bg-blue-50 border-blue-200',
                   grammar: 'bg-green-50 border-green-200', 
                   conversation: 'bg-orange-50 border-orange-200',
                   reading: 'bg-purple-50 border-purple-200',
                   writing: 'bg-pink-50 border-pink-200'
                 };
                 
                 const dotColors = {
                   vocabulary: 'bg-blue-500',
                   grammar: 'bg-green-500',
                   conversation: 'bg-orange-500', 
                   reading: 'bg-purple-500',
                   writing: 'bg-pink-500'
                 };
                 
                 const formatDate = (dateStr: string, timeStr: string) => {
                   const date = new Date(dateStr);
                   const today = new Date();
                   const tomorrow = new Date(today);
                   tomorrow.setDate(today.getDate() + 1);
                   
                   if (date.toDateString() === today.toDateString()) {
                     return `Today, ${timeStr}`;
                   } else if (date.toDateString() === tomorrow.toDateString()) {
                     return `Tomorrow, ${timeStr}`;
                   } else {
                     return `${date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}, ${timeStr}`;
                   }
                 };
                 
                 return (
                   <div key={session.id} className={`flex items-center justify-between p-3 rounded-lg border ${typeColors[session.type]}`}>
                     <div className="flex items-center space-x-3">
                       <div className={`w-3 h-3 rounded-full ${dotColors[session.type]}`}></div>
                       <div>
                         <p className="font-medium text-gray-800">{session.title}</p>
                         <p className="text-sm text-gray-600">{formatDate(session.date, session.time)}</p>
                       </div>
                     </div>
                     <button 
                       onClick={() => {
                         // TODO: Implement edit functionality
                         console.log('Edit session:', session.id);
                       }}
                       className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                     >
                       Edit
                     </button>
                   </div>
                 );
               })
          )}
        </div>
      </div>
      
      <ScheduleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        onSave={handleSaveSession}
      />
    </div>
  );
}