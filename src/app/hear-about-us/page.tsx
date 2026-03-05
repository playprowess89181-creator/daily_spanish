'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { useAuth } from '../../lib/AuthContext';

const OPTIONS = [
  'News, articles, blog',
  'App Store',
  'YouTube',
  'Facebook / Instagram',
  'Google search',
  'TikTok',
  'Other',
];

export default function HearAboutUsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState('');
  const { updateProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleContinue = async () => {
    if (!selected || isSaving) return;
    setIsSaving(true);
    try {
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('heardAboutUs', selected);
        }
      } catch {}
      const res = await updateProfile({ referral_source: selected });
      if (!res.success) {
        throw new Error(res.error || 'Failed to save survey response');
      }
      router.push('/legal-notice');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, var(--verde-menta) 0%, var(--rosa-palo) 50%, var(--naranja) 100%)' }}>
      <div className="floating-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>

      <Navbar />

      <div className="flex min-h-screen pt-16">
        <div className="w-full flex items-center justify-center p-6 sm:p-12 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-blue-50"></div>

          <div className="w-full max-w-xl relative z-10">
            <div className="glass-effect rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #3B4BB1, #F25A37)' }}>
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-3xl font-bold gradient-text mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  How did you hear about dailyspanish?
                </h2>
                <p className="text-gray-600">Choose one option below</p>
              </div>

              <div className="space-y-3">
                {OPTIONS.map((option) => (
                  <label key={option} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${selected === option ? 'border-orange-400 bg-white/80' : 'border-gray-200 bg-white/70'}`}> 
                    <input
                      type="radio"
                      name="heardAboutUs"
                      value={option}
                      checked={selected === option}
                      onChange={() => setSelected(option)}
                      className="w-5 h-5 accent-orange-500"
                    />
                    <span className="text-gray-800 font-medium">{option}</span>
                  </label>
                ))}
              </div>

              <div className="pt-6">
                <button
                  onClick={handleContinue}
                  disabled={!selected || isSaving}
                  className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-300 ${selected ? 'btn-gradient hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                  {isSaving ? 'Saving...' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

