'use client';

import React from 'react';

const CourseHistory = () => {
  return (
    <div>
      <h3 className="text-2xl font-bold gradient-text mb-6" style={{fontFamily: 'Plus Jakarta Sans, sans-serif'}}>
        Course History
      </h3>
      <div className="space-y-4">
        {/* Completed Course */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Spanish Vocabulary Builder</h4>
              <p className="text-gray-600 text-sm">Completed on November 28, 2024</p>
              <p className="text-green-600 text-sm font-medium">Certificate Earned</p>
            </div>
          </div>
          <button className="btn-ochre text-white px-6 py-2 rounded-lg font-medium">
            Repurchase
          </button>
        </div>

        {/* Another Completed Course */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Spanish Pronunciation Guide</h4>
              <p className="text-gray-600 text-sm">Completed on October 15, 2024</p>
              <p className="text-green-600 text-sm font-medium">Certificate Earned</p>
            </div>
          </div>
          <button className="btn-ochre text-white px-6 py-2 rounded-lg font-medium">
            Repurchase
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseHistory;