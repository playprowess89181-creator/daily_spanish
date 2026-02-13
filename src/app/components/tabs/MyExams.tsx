'use client';

import React, { useState } from 'react';

export default function MyExams() {
  const [activeTab, setActiveTab] = useState('pending');

  return (
    <div>
      <h3 className="text-2xl font-bold gradient-text mb-6" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
        My Exams
      </h3>
      
      {/* Exam Sub-tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-2">
          <button 
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              activeTab === 'pending' 
                ? 'exam-tab-button active' 
                : 'exam-tab-button'
            }`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Exams
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              activeTab === 'history' 
                ? 'exam-tab-button active' 
                : 'exam-tab-button'
            }`}
            onClick={() => setActiveTab('history')}
          >
            Exam History
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              activeTab === 'results' 
                ? 'exam-tab-button active' 
                : 'exam-tab-button'
            }`}
            onClick={() => setActiveTab('results')}
          >
            My Results
          </button>
        </nav>
      </div>
      
      {/* Pending Exams */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Spanish Level 1 Assessment</h4>
                <p className="text-gray-600 text-sm">Scheduled: December 20, 2024 at 2:00 PM</p>
                <p className="text-orange-600 text-sm font-medium">Duration: 60 minutes</p>
              </div>
            </div>
            <button className="btn-gradient text-white px-6 py-2 rounded-lg font-medium">
              Start Exam
            </button>
          </div>
        </div>
      )}
      
      {/* Exam History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Spanish Vocabulary Test</h4>
                <p className="text-gray-600 text-sm">Completed: November 30, 2024</p>
                <p className="text-gray-500 text-sm">Duration: 45 minutes</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* My Results */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          {/* Passed Exam */}
          <div className="exam-pass rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Spanish Vocabulary Test</h4>
                  <p className="text-gray-600 text-sm">Completed: November 30, 2024</p>
                  <p className="text-green-700 font-medium">Score: 85% - PASSED</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-700 font-bold text-2xl">A</p>
                <p className="text-green-600 text-sm">Excellent</p>
              </div>
            </div>
          </div>
          
          {/* Failed Exam */}
          <div className="exam-fail rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Spanish Grammar Assessment</h4>
                  <p className="text-gray-600 text-sm">Completed: November 15, 2024</p>
                  <p className="text-red-700 font-medium">Score: 58% - FAILED</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-red-700 font-bold text-2xl">F</p>
                <p className="text-red-600 text-sm">Needs Improvement</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <p className="text-red-700 text-sm"><strong>Feedback:</strong> Focus on verb conjugations and sentence structure. Consider retaking the grammar course before attempting the exam again.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}