'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import Header from '../../../components/Header';
import { COUNTRIES, LANGUAGES } from '../../../../../lib/options';
import { withAdminAuth } from '../../../../../lib/AuthContext';

type UserDetail = {
  id: string;
  name: string | null;
  email: string;
  country: string | null;
  native_language: string | null;
  level: string | null;
  nickname: string | null;
  gender: string | null;
  age: number | null;
  profile_image: string | null;
  is_active: boolean;
  is_blocked: boolean;
};

function useAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

function EditUserPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const token = useAccessToken();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState<UserDetail | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [form, setForm] = useState({
    name: '',
    country: '',
    native_language: '',
    email: '',
    password: '',
    nickname: '',
    gender: '',
    age: '',
    level: '',
    profile_image: '',
  });

  const levelOptions = useMemo(
    () => [
      { value: '', label: 'Select level' },
      { value: 'A1', label: 'A1 – Beginner' },
      { value: 'A2', label: 'A2 – Elementary' },
      { value: 'B1', label: 'B1 – Intermediate' },
      { value: 'B2', label: 'B2 – Upper-Intermediate' },
      { value: 'C1', label: 'C1 – Advanced' },
    ],
    []
  );

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    try {
      const res = await fetch(`${base}/api/auth/users/${id}/`, {
        headers: { Authorization: token ? `Bearer ${token}` : '', 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Failed to load user');
        setUser(null);
      } else {
        const u: UserDetail = data.user;
        setUser(u);
        setImagePreview(u.profile_image || '');
        setForm({
          name: u.name || '',
          country: u.country || '',
          native_language: u.native_language || '',
          email: u.email || '',
          password: '',
          nickname: u.nickname || '',
          gender: (u.gender || '').toLowerCase(),
          age: u.age != null ? String(u.age) : '',
          level: u.level || '',
          profile_image: u.profile_image || '',
        });
      }
    } catch {
      setError('Network error. Please try again.');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => {
      if (ev.target?.result && typeof ev.target.result === 'string') {
        setImagePreview(ev.target.result);
        setForm((prev) => ({ ...prev, profile_image: ev.target?.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError('');

    const payload: Record<string, unknown> = {
      name: form.name,
      country: form.country,
      native_language: form.native_language,
      email: form.email,
      nickname: form.nickname,
      gender: form.gender,
      age: form.age,
      level: form.level,
      profile_image: form.profile_image,
    };
    if (form.password.trim()) payload.password = form.password;

    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    try {
      const res = await fetch(`${base}/api/auth/users/${id}/`, {
        method: 'PATCH',
        headers: { Authorization: token ? `Bearer ${token}` : '', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Failed to update user');
        return;
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('users:changed'));
      }
      router.push(`/admin/user-management/${id}`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} activeItem="user-management" />
      <div className="lg:ml-64 flex flex-col flex-1">
        <Header title="Edit User" onToggleSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {error ? (
              <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold">
                {error}
              </div>
            ) : null}

            <div className="bg-white text-gray-900 rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #3B4BB1, #F25A37)' }}
                  >
                    <i className="fas fa-user-pen text-white text-2xl"></i>
                  </div>
                </div>
                <h2 className="text-3xl font-extrabold gradient-text mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Update User Details
                </h2>
                <p className="text-gray-600">{user?.email || (loading ? 'Loading…' : '')}</p>
              </div>

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
                      value={form.name}
                      onChange={handleChange}
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
                        value={form.country}
                        onChange={handleChange}
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
                      value={form.native_language}
                      onChange={handleChange}
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
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="nickname">
                      Nickname
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-xl outline-none border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-white"
                      id="nickname"
                      name="nickname"
                      placeholder="Optional"
                      type="text"
                      value={form.nickname}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="level">
                      Level
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 pr-10 rounded-xl outline-none border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-white appearance-none"
                        id="level"
                        name="level"
                        value={form.level}
                        onChange={handleChange}
                      >
                        {levelOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Image src="/assets/icons/chevron-down.svg" alt="Dropdown" width={20} height={20} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="gender">
                      Gender
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 pr-10 rounded-xl outline-none border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-white appearance-none"
                        id="gender"
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Image src="/assets/icons/chevron-down.svg" alt="Dropdown" width={20} height={20} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="age">
                      Age
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-xl outline-none border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-white"
                      id="age"
                      name="age"
                      placeholder="Optional"
                      type="number"
                      value={form.age}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Image</label>
                  <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center flex-none">
                        {imagePreview ? (
                          <img src={imagePreview} alt="preview" className="h-full w-full object-cover" />
                        ) : (
                          <i className="fas fa-image text-gray-400 text-xl"></i>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-extrabold text-gray-900">Upload a profile image</div>
                        <div className="mt-1 text-xs font-semibold text-gray-500">PNG, JPG, or WEBP</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          id="profile_image_file"
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="profile_image_file"
                          className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-extrabold text-white shadow-sm hover:opacity-90 cursor-pointer"
                          style={{ backgroundColor: 'var(--azul-ultramar)' }}
                        >
                          Choose File
                        </label>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-extrabold text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                          onClick={() => {
                            setImagePreview('');
                            setForm((prev) => ({ ...prev, profile_image: '' }));
                          }}
                          disabled={!imagePreview}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="password">
                    New Password (optional)
                  </label>
                  <div className="relative">
                    <input
                      autoComplete="new-password"
                      className="w-full px-4 py-3 pr-12 rounded-xl outline-none border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-white"
                      id="password"
                      name="password"
                      placeholder="Leave empty to keep current password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
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
                      saving ? 'bg-gray-400 cursor-not-allowed' : 'btn-gradient hover:shadow-xl focus:outline-none'
                    }`}
                    type="submit"
                    disabled={saving || loading || !id}
                  >
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    className="py-4 px-6 rounded-xl text-gray-700 font-extrabold border-2 border-gray-200 hover:bg-gray-50 transition-all duration-200"
                    onClick={() => router.push(`/admin/user-management/${id}`)}
                    disabled={saving}
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

export default withAdminAuth(EditUserPage);
