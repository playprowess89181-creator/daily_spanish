'use client';

import React from 'react';

const Notifications = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold gradient-text mb-6">Notifications</h2>
      
      <div className="space-y-3">
        {/* New Course Available */}
        <div className="bg-orange-50 border-l-4 border-l-orange-500 rounded-xl p-4 relative">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-base font-semibold text-gray-900">
                New Course Available!
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Advanced Spanish Conversation is now available. Start learning today!
              </p>
              <p className="text-xs text-gray-500 mt-2">2 hours ago</p>
            </div>
            <div className="absolute top-3 right-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Payment Successful */}
        <div className="bg-white border-l-4 border-l-green-500 rounded-xl p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-base font-semibold text-gray-900">
                Payment Successful
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Your payment for "Spanish Grammar Basics" has been processed successfully.
              </p>
              <p className="text-xs text-gray-500 mt-2">1 day ago</p>
            </div>
          </div>
        </div>

        {/* Exam Reminder */}
        <div className="bg-orange-50 border-l-4 border-l-orange-500 rounded-xl p-4 relative">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-base font-semibold text-gray-900">
                Exam Reminder
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Your Spanish Level 1 exam is scheduled for tomorrow at 2:00 PM.
              </p>
              <p className="text-xs text-gray-500 mt-2">5 hours ago</p>
            </div>
            <div className="absolute top-3 right-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;