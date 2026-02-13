'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProfileNavbar from '../components/ProfileNavbar';
import { useAuth, withAuth } from '../../lib/AuthContext';

const ProfilePage = () => {
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nickname: '',
    gender: '',
    age: '',
    profile_image: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { user, updateProfile, isAuthenticated, refreshUser } = useAuth();

  useEffect(() => {
    // Populate form once user is available; avoid redirecting here.
    if (user) {
      setFormData({
        nickname: user.nickname || '',
        gender: (user.gender || '').toLowerCase(),
        age: user.age?.toString() || '',
        profile_image: user.profile_image || ''
      });
      setAvatarImage(user.profile_image || null);
    }
  }, [user]);

  // Ensure fresh profile data is loaded immediately on first mount
  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, [isAuthenticated, refreshUser]);

  const handleAvatarClick = () => {
    document.getElementById('avatarInput')?.click();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          setAvatarImage(e.target.result);
          setFormData(prev => ({ ...prev, profile_image: e.target?.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const profileData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : undefined
      };
      const result = await updateProfile(profileData);
      if (result.success) {
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(result.error || 'Failed to update profile');
      }
    } catch {
      setErrorMessage('An error occurred while updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      
      <div className="min-h-screen" style={{
        background: 'linear-gradient(135deg, #86C2A8 0%, #F4D0D0 50%, #F25A37 100%)'
      }}>
        {/* Floating Background Shapes */}
        <div className="floating-shapes">
          <div className="shape"></div>
          <div className="shape"></div>
          <div className="shape"></div>
        </div>

        <ProfileNavbar />
        
        {/* Main Content */}
        <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto">
            {/* Top Profile Section */}
            <div className="glass-effect rounded-3xl shadow-2xl p-8 mb-8 border border-white/20">
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center">
                  <div className="avatar-upload relative" onClick={handleAvatarClick}>
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-orange-400 flex items-center justify-center text-white text-4xl font-bold shadow-lg overflow-hidden">
                        {avatarImage ? (
                          <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span id="avatarInitials">{user?.name?.[0] || user?.email?.[0] || 'U'}</span>
                        )}
                      </div>
                      <input type="file" id="avatarInput" accept="image/*" onChange={handleAvatarChange} style={{display: 'none'}} />
                      <div className="absolute -bottom-2 -right-2 bg-orange-500 rounded-full p-2 shadow-lg cursor-pointer" onClick={(e) => { e.stopPropagation(); handleAvatarClick(); }}>
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                  <p className="text-sm text-gray-500 mt-2 text-center cursor-pointer" onClick={handleAvatarClick}>Click to upload<br/>new avatar</p>
                </div>

                {/* User Info Section */}
                <div className="flex-1 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Registered Name (Fixed) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Registered Name</label>
                      <div className="bg-gray-100 rounded-lg px-4 py-3 text-gray-600">
                        <span className="flex items-center">
                          <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          {user?.name || user?.email}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Only editable by Admin</p>
                    </div>

                    {/* Nickname (Editable) */}
                    <div>
                      <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">Nickname</label>
                      <input 
                        type="text" 
                        id="nickname" 
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm" 
                      />
                    </div>

                    {/* Gender (Editable) */}
                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <div className="relative">
                        <select 
                          id="gender" 
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm appearance-none"
                        >
                          <option value="" disabled>Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 8l4 4 4-4" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Age (Editable) */}
                    <div>
                      <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                      <input 
                        type="number" 
                        id="age" 
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        min="13" 
                        max="120" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm" 
                      />
                    </div>
                  </div>

                  {/* Save Changes Button */}
                  <div className="mt-6">
                    <button 
                      id="saveProfileBtn" 
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="btn-ochre text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-yellow-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="flex items-center">
                        {isLoading ? (
                          <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </span>
                    </button>
                    
                    {/* Success/Error Messages */}
                    {successMessage && (
                      <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                        {successMessage}
                      </div>
                    )}
                    {errorMessage && (
                      <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {errorMessage}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-effect rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Quick access</h2>
                  <p className="text-sm text-gray-600 mt-1">Jump straight into what you need.</p>
                </div>
                <Link
                  href="/dashboard"
                  className="mt-4 sm:mt-0 inline-flex items-center justify-center rounded-xl bg-white/70 border border-gray-200 px-4 py-2 text-sm font-semibold text-[var(--azul-ultramar)] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-orange-200"
                >
                  Open dashboard
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <Link
                  href="/dashboard?tab=notifications"
                  className="group relative overflow-hidden rounded-2xl border border-white/30 bg-white/70 p-4 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-200"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-orange-50/70 via-white/0 to-white/0"></div>
                  <div className="relative flex items-start gap-4">
                    <div className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center shadow-md">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM11 19H6a2 2 0 01-2-2V7a2 2 0 012-2h5m5 0v5" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900">Notifications</div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-0.5">Updates and messages</div>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/dashboard?tab=receipts"
                  className="group relative overflow-hidden rounded-2xl border border-white/30 bg-white/70 p-4 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-200"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-blue-50/70 via-white/0 to-white/0"></div>
                  <div className="relative flex items-start gap-4">
                    <div className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900">Receipt</div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-0.5">Billing and invoices</div>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/dashboard?tab=password-email"
                  className="group relative overflow-hidden rounded-2xl border border-white/30 bg-white/70 p-4 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-200"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-yellow-50/70 via-white/0 to-white/0"></div>
                  <div className="relative flex items-start gap-4">
                    <div className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-md">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900">Email &amp; Password</div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-0.5">Account security</div>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/dashboard?tab=my-courses"
                  className="group relative overflow-hidden rounded-2xl border border-white/30 bg-white/70 p-4 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-200"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-emerald-50/70 via-white/0 to-white/0"></div>
                  <div className="relative flex items-start gap-4">
                    <div className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900">Lessons</div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-0.5">Pick up where you left off</div>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/dashboard?tab=course-history"
                  className="group relative overflow-hidden rounded-2xl border border-white/30 bg-white/70 p-4 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-200"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-violet-50/70 via-white/0 to-white/0"></div>
                  <div className="relative flex items-start gap-4">
                    <div className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-md">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900">Course History</div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-0.5">Review past progress</div>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/dashboard?tab=my-exams"
                  className="group relative overflow-hidden rounded-2xl border border-white/30 bg-white/70 p-4 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-200 sm:col-span-2 lg:col-span-3"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-slate-50/70 via-white/0 to-white/0"></div>
                  <div className="relative flex items-start gap-4">
                    <div className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-md">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900">My Exams</div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-0.5">Take and review exams</div>
                    </div>
                    <div className="ml-auto hidden sm:flex items-center text-[var(--azul-ultramar)]">
                      <svg className="h-5 w-5 opacity-60 group-hover:opacity-100 transition-opacity duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default withAuth(ProfilePage);
