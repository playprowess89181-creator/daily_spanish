'use client';
import React from 'react';

export default function PasswordEmail() {
  return (
    <div>
      <h3 className="text-2xl font-bold gradient-text mb-6" style={{fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
        Password & Email Settings
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Email Update */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Update Email Address</h4>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Email</label>
              <input type="email" value="john.smith@email.com" disabled className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Email Address</label>
              <input type="email" placeholder="Enter new email address" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input type="password" placeholder="Enter current password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm" />
            </div>
            <button type="submit" className="btn-gradient w-full text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300">
              Update Email
            </button>
          </form>
        </div>

        {/* Password Update */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h4>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input type="password" placeholder="Enter current password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input type="password" placeholder="Enter new password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <input type="password" placeholder="Confirm new password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm" />
            </div>
            <button type="submit" className="btn-gradient w-full text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300">
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}