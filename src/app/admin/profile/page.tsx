'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth, withAdminAuth } from '../../../lib/AuthContext';

function AdminProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, updateProfile, logout } = useAuth();
  const [form, setForm] = useState({
    name: '',
    country: '',
    native_language: '',
    nickname: '',
    gender: '',
    age: '' as string | number | undefined,
    profile_image: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  type ProfileUpdatePayload = {
    name?: string;
    country?: string;
    native_language?: string;
    nickname?: string;
    gender?: string;
    age?: number;
    profile_image?: string;
  };

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        country: user.country || '',
        native_language: user.native_language || '',
        nickname: user.nickname || '',
        gender: user.gender || '',
        age: typeof user.age === 'number' ? String(user.age) : '',
        profile_image: user.profile_image || ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const payload: ProfileUpdatePayload = {
      name: form.name,
      country: form.country,
      native_language: form.native_language,
      nickname: form.nickname,
      gender: form.gender,
      profile_image: form.profile_image
    };
    if (form.age !== '' && form.age !== undefined) {
      payload.age = Number(form.age);
    }
    const res = await updateProfile(payload);
    if (res.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } else {
      setMessage({ type: 'error', text: res.error || 'Update failed' });
    }
    setSaving(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} activeItem="profile" />
      <div className="lg:ml-64 flex flex-col flex-1">
        <Header title="Admin Profile" onToggleSidebar={() => setSidebarOpen(true)} showExportButton={false} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {form.profile_image ? (
                      <img src={form.profile_image} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                      <i className="fas fa-user text-gray-500 text-xl"></i>
                    )}
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-gray-900">{user?.name || 'Admin'}</div>
                    <div className="text-sm text-gray-500">{user?.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={logout} className="px-4 py-2 rounded-md text-white transition-colors hover:opacity-90" style={{ backgroundColor: 'var(--naranja)' }}>
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    Logout
                  </button>
                </div>
              </div>
              {message && (
                <div className={`mb-4 px-4 py-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {message.text}
                </div>
              )}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input name="name" value={form.name} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input name="country" value={form.country} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Native Language</label>
                  <input name="native_language" value={form.native_language} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
                  <input name="nickname" value={form.nickname} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select name="gender" value={form.gender} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input name="age" type="number" value={form.age as string} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
                  <input name="profile_image" value={form.profile_image} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="md:col-span-2 flex justify-end space-x-3">
                  <button type="submit" disabled={saving} className="px-4 py-2 rounded-md text-white" style={{ backgroundColor: 'var(--azul-ultramar)', opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Saving...' : 'Save Changes'}
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

export default withAdminAuth(AdminProfilePage);

