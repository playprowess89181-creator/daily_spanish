'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { COUNTRIES, LANGUAGES } from '../../../../lib/options';
import { withAdminAuth } from '../../../../lib/AuthContext';

function useAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

function AddUserPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    native_language: '',
    email: '',
    password: '',
  });
  const token = useAccessToken();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    try {
      const res = await fetch(`${base}/api/auth/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Failed to create user');
        return;
      }
      router.push(`/admin/user-management/${data.user_id}`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} activeItem="user-management" />
      <div className="lg:ml-64 flex flex-col flex-1">
        <Header title="Add User" onToggleSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-white text-gray-900 rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #3B4BB1, #F25A37)' }}
                  >
                    <i className="fas fa-user-plus text-white text-2xl"></i>
                  </div>
                </div>
                <h2 className="text-3xl font-extrabold gradient-text mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Create User Account
                </h2>
                <p className="text-gray-600">Add a new user to the platform.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="name">
                      Name
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-xl outline-none border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-white"
                      id="name"
                      name="name"
                      placeholder="e.g. Maria Rodriguez"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="country">
                      Country
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 pr-10 rounded-xl outline-none border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-white appearance-none"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                      >
                        <option disabled value="">
                          Select country
                        </option>
                        {COUNTRIES.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Image src="/assets/icons/chevron-down.svg" alt="Dropdown" width={20} height={20} />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="native_language">
                    Native Language
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 pr-10 rounded-xl outline-none border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-white appearance-none"
                      id="native_language"
                      name="native_language"
                      value={formData.native_language}
                      onChange={handleInputChange}
                      required
                    >
                      <option disabled value="">
                        Select native language
                      </option>
                      {LANGUAGES.map((language) => (
                        <option key={language} value={language}>
                          {language}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Image src="/assets/icons/chevron-down.svg" alt="Dropdown" width={20} height={20} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-xl outline-none border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-white"
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      autoComplete="new-password"
                      className="w-full px-4 py-3 pr-12 rounded-xl outline-none border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-white"
                      id="password"
                      name="password"
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center rounded-r-xl transition-colors duration-200"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      <Image
                        src={showPassword ? '/assets/icons/eye-closed.svg' : '/assets/icons/eye-open.svg'}
                        alt={showPassword ? 'Hide password' : 'Show password'}
                        width={20}
                        height={20}
                      />
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button
                    className={`flex-1 py-4 px-6 rounded-xl text-white font-extrabold text-lg shadow-lg transition-all duration-300 ${
                      isLoading ? 'bg-gray-400 cursor-not-allowed' : 'btn-gradient hover:shadow-xl focus:outline-none'
                    }`}
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating…' : 'Create User'}
                  </button>
                  <button
                    type="button"
                    className="py-4 px-6 rounded-xl text-gray-700 font-extrabold border-2 border-gray-200 hover:bg-gray-50 transition-all duration-200"
                    onClick={() => router.push('/admin/user-management')}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default withAdminAuth(AddUserPage);
