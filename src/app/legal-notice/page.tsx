'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { useAuth } from '../../lib/AuthContext';

export default function LegalNoticePage() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const { updateProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleAccept = async () => {
    if (!accepted || isSaving) return;
    setIsSaving(true);
    try {
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('legalNoticeAccepted', 'true');
        }
      } catch {}
      const res = await updateProfile({ legal_notice_accepted: true });
      if (!res.success) {
        throw new Error(res.error || 'Failed to save acceptance');
      }
      router.push('/profile');
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

          <div className="w-full max-w-2xl relative z-10">
            <div className="glass-effect rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #3B4BB1, #F25A37)' }}>
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h8M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-3xl font-bold gradient-text mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Legal Notice
                </h2>
                <p className="text-gray-600">Please read and accept to continue</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl p-6 max-h-72 overflow-y-auto text-gray-700">
                <p className="mb-4">
                  By continuing you confirm that you understand and accept the terms of service, privacy policy, and usage guidelines of Daily Spanish. Your data is processed in accordance with applicable regulations. If you are under the age where parental consent is required in your region, ensure consent is obtained.
                </p>
                <p>
                  You agree to use the platform respectfully, avoid unauthorized sharing of content, and comply with local laws. If you do not accept, do not proceed. For more details review our policies on the website.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <input
                  id="acceptLegal"
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="w-5 h-5 accent-orange-500"
                />
                <label htmlFor="acceptLegal" className="text-gray-800 font-medium">
                  I accept the legal notice
                </label>
              </div>

              <div className="pt-6">
                <button
                  onClick={handleAccept}
                  disabled={!accepted || isSaving}
                  className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-300 ${accepted ? 'btn-gradient hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                  {isSaving ? 'Saving...' : 'Accept and Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

