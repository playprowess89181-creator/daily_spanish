'use client';

import React from 'react';

export default function LevelReview() {
  return (
    <div>
      <h3 className="text-2xl font-bold gradient-text mb-6" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
        Student Level Review
      </h3>
      
      {/* Current Level Overview */}
      <div className="glass-effect rounded-xl p-6 border border-white/20 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-2xl font-bold text-gray-800">Current Level: Intermediate (B1)</h4>
            <p className="text-gray-600 mt-1">You're making great progress! Keep up the excellent work.</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold gradient-text">67%</div>
            <p className="text-sm text-gray-600">Level Progress</p>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div className="progress-bar" style={{width: '67%'}}></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-800">24</div>
            <p className="text-sm text-gray-600">Lessons Completed</p>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-800">12</div>
            <p className="text-sm text-gray-600">Lessons Remaining</p>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-800">8.5</div>
            <p className="text-sm text-gray-600">Average Score</p>
          </div>
        </div>
      </div>
      
      {/* Current Lesson */}
      <div className="glass-effect rounded-xl p-6 border border-white/20 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                25
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-800">Lesson 25: Subjunctive Mood</h4>
                <p className="text-gray-600">Advanced Grammar • Intermediate Level</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4">
              Learn how to use the subjunctive mood in Spanish to express doubt, emotion, desire, and hypothetical situations. This lesson covers the present subjunctive conjugations and common trigger phrases.
            </p>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-600">45 minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm text-gray-600">12 exercises</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm text-gray-600">Difficulty: Hard</span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-orange-500 h-2 rounded-full" style={{width: '35%'}}></div>
            </div>
            <p className="text-sm text-gray-600 mb-4">Progress: 35% completed</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button className="btn-gradient text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300">
            <span className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Continue Lesson
            </span>
          </button>
          <button className="btn-mint text-gray-800 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-200 transition-all duration-300">
            <span className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Review Previous
            </span>
          </button>
        </div>
      </div>
      
      {/* Recent Lessons */}
      <div className="glass-effect rounded-xl p-6 border border-white/20">
        <h4 className="text-xl font-bold text-gray-800 mb-4">Recent Lessons</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                24
              </div>
              <div>
                <p className="font-medium text-gray-800">Conditional Tense</p>
                <p className="text-sm text-gray-600">Completed • Score: 9.2/10</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                23
              </div>
              <div>
                <p className="font-medium text-gray-800">Future Tense</p>
                <p className="text-sm text-gray-600">Completed • Score: 8.7/10</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                22
              </div>
              <div>
                <p className="font-medium text-gray-800">Imperfect vs Preterite</p>
                <p className="text-sm text-gray-600">Completed • Score: 8.9/10</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}