'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProfileNavbar from '../../components/ProfileNavbar';
import { withAuth } from '../../../lib/AuthContext';

type PlanKey = 'monthly' | 'yearly';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || '') + '/api/auth';

function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE_URL}/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    const data = await res.json();
    if (!res.ok || !data?.access) return false;
    try {
      if (localStorage.getItem('refresh_token')) {
        localStorage.setItem('access_token', data.access);
      } else {
        sessionStorage.setItem('access_token', data.access);
      }
    } catch {}
    return true;
  } catch {
    return false;
  }
}

type OnboardingPayload = {
  plan_key: PlanKey;
  reason: string;
  reason_other?: string;
  daily_goal: string;
  spanish_knowledge: string;
  start_preference: string;
};

function PricingOnboardingPage() {
  const router = useRouter();
  const params = useSearchParams();
  const plan = ((params.get('plan') || 'monthly').toLowerCase() as PlanKey) || 'monthly';

  const [reason, setReason] = useState<string>('');
  const [reasonOther, setReasonOther] = useState('');
  const [dailyGoal, setDailyGoal] = useState<string>('');
  const [knowledge, setKnowledge] = useState<string>('');
  const [startPreference, setStartPreference] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const reasons = useMemo(
    () => [
      { key: 'exercise_mind', label: 'Exercise my mind' },
      { key: 'travel', label: 'Prepare for travel' },
      { key: 'career', label: 'Boost my professional career' },
      { key: 'fun', label: 'For fun' },
      { key: 'studies', label: 'Enhance studies' },
      { key: 'connect', label: 'Connect with people' },
      { key: 'other', label: 'Other (write your answer)' },
    ],
    []
  );

  const dailyGoals = useMemo(
    () => [
      { key: '15', label: '15 minutes per day' },
      { key: '30', label: '30 minutes per day' },
      { key: '60', label: '1 hour per day' },
    ],
    []
  );

  const knowledgeOptions = useMemo(
    () => [
      { key: 'starting', label: 'I am just starting to learn' },
      { key: 'common_words', label: 'I know some common words' },
      { key: 'simple_conversations', label: 'I can have simple conversations' },
      { key: 'several_topics', label: 'I can converse on several topics' },
      { key: 'debate', label: 'I can debate in detail on most topics' },
    ],
    []
  );

  const startOptions = useMemo(
    () => [
      {
        key: 'beginning',
        title: 'Recommended: From the beginning',
        description: 'Complete the easiest lesson to avoid doubts at more advanced levels.',
      },
      {
        key: 'discover',
        title: 'Discover my level',
        description: 'Daily Spanish will recommend where to start based on test results.',
      },
    ],
    []
  );

  const submit = async () => {
    if (isSubmitting) return;
    setError('');

    if (!reason) return setError('Please select a reason.');
    if (reason === 'other' && !reasonOther.trim()) return setError('Please write your reason.');
    if (!dailyGoal) return setError('Please select your daily learning goal.');
    if (!knowledge) return setError('Please select your current Spanish knowledge level.');
    if (!startPreference) return setError('Please select where to start.');

    setIsSubmitting(true);
    const payload: OnboardingPayload = {
      plan_key: plan,
      reason,
      reason_other: reason === 'other' ? reasonOther.trim() : '',
      daily_goal: dailyGoal,
      spanish_knowledge: knowledge,
      start_preference: startPreference,
    };

    const attempt = async (token: string) => {
      return fetch(`${API_BASE_URL}/subscription/onboarding/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    };

    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        router.push('/login');
        return;
      }

      let res = await attempt(accessToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          const retryToken = getAccessToken();
          if (retryToken) res = await attempt(retryToken);
        }
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const details = data?.details;
        if (details?.reason_other?.[0]) {
          throw new Error(details.reason_other[0]);
        }
        throw new Error(data?.error || 'Unable to save questionnaire');
      }

      if (data?.next === 'test') {
        router.push(`/pricing/placement-test?plan=${encodeURIComponent(plan)}`);
        return;
      }
      router.push(`/cart?plan=${encodeURIComponent(plan)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save questionnaire');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #86C2A8 0%, #F4D0D0 50%, #F25A37 100%)',
      }}
    >
      <div className="floating-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>

      <ProfileNavbar />

      <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto">
          <div className="glass-effect rounded-3xl shadow-2xl p-6 sm:p-10 border border-white/20">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-gray-700">
                  <span className="h-2 w-2 rounded-full bg-[var(--amarillo-ocre)] shadow-[0_0_0_6px_rgba(236,164,0,0.14)]"></span>
                  First-time purchase
                </div>
                <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">Quick questionnaire</h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl">
                  Answer a few questions so Daily Spanish can recommend the best starting point.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white/70 px-4 py-3 text-right">
                <div className="text-[11px] font-semibold text-gray-600">Selected plan</div>
                <div className="text-gray-900 font-extrabold">{plan === 'yearly' ? 'Annual' : 'Monthly'}</div>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div className="rounded-3xl border border-gray-200 bg-white/75 p-5 sm:p-6 shadow-md">
                <div className="text-gray-900 font-extrabold">1. Why do you want to learn Spanish?</div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {reasons.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setReason(opt.key)}
                      className={`text-left rounded-2xl border px-4 py-3 transition-colors ${
                        reason === opt.key ? 'border-[var(--azul-ultramar)] bg-white' : 'border-gray-200 bg-white/70 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-gray-800 font-semibold text-sm">{opt.label}</div>
                        <div
                          className={`h-5 w-5 rounded-full border flex items-center justify-center flex-none mt-0.5 ${
                            reason === opt.key ? 'border-[var(--azul-ultramar)]' : 'border-gray-300'
                          }`}
                        >
                          {reason === opt.key ? <div className="h-2.5 w-2.5 rounded-full bg-[var(--azul-ultramar)]"></div> : null}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {reason === 'other' ? (
                  <div className="mt-4">
                    <textarea
                      value={reasonOther}
                      onChange={(e) => setReasonOther(e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
                      rows={3}
                      placeholder="Write your answer…"
                    />
                  </div>
                ) : null}
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white/75 p-5 sm:p-6 shadow-md">
                <div className="text-gray-900 font-extrabold">2. What is your daily learning goal?</div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {dailyGoals.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setDailyGoal(opt.key)}
                      className={`text-left rounded-2xl border px-4 py-3 transition-colors ${
                        dailyGoal === opt.key ? 'border-[var(--azul-ultramar)] bg-white' : 'border-gray-200 bg-white/70 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-gray-800 font-semibold text-sm">{opt.label}</div>
                        <div
                          className={`h-5 w-5 rounded-full border flex items-center justify-center flex-none ${
                            dailyGoal === opt.key ? 'border-[var(--azul-ultramar)]' : 'border-gray-300'
                          }`}
                        >
                          {dailyGoal === opt.key ? <div className="h-2.5 w-2.5 rounded-full bg-[var(--azul-ultramar)]"></div> : null}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white/75 p-5 sm:p-6 shadow-md">
                <div className="text-gray-900 font-extrabold">3. How much Spanish do you know?</div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {knowledgeOptions.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setKnowledge(opt.key)}
                      className={`text-left rounded-2xl border px-4 py-3 transition-colors ${
                        knowledge === opt.key ? 'border-[var(--azul-ultramar)] bg-white' : 'border-gray-200 bg-white/70 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-gray-800 font-semibold text-sm">{opt.label}</div>
                        <div
                          className={`h-5 w-5 rounded-full border flex items-center justify-center flex-none mt-0.5 ${
                            knowledge === opt.key ? 'border-[var(--azul-ultramar)]' : 'border-gray-300'
                          }`}
                        >
                          {knowledge === opt.key ? <div className="h-2.5 w-2.5 rounded-full bg-[var(--azul-ultramar)]"></div> : null}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white/75 p-5 sm:p-6 shadow-md">
                <div className="text-gray-900 font-extrabold">4. Where do we start?</div>
                <div className="mt-4 grid grid-cols-1 gap-2.5">
                  {startOptions.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setStartPreference(opt.key)}
                      className={`text-left rounded-2xl border px-4 py-4 transition-colors ${
                        startPreference === opt.key
                          ? 'border-[var(--azul-ultramar)] bg-white'
                          : 'border-gray-200 bg-white/70 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-gray-900 font-extrabold text-sm">{opt.title}</div>
                          <div className="mt-1 text-gray-600 text-sm">{opt.description}</div>
                        </div>
                        <div
                          className={`h-5 w-5 rounded-full border flex items-center justify-center flex-none mt-0.5 ${
                            startPreference === opt.key ? 'border-[var(--azul-ultramar)]' : 'border-gray-300'
                          }`}
                        >
                          {startPreference === opt.key ? <div className="h-2.5 w-2.5 rounded-full bg-[var(--azul-ultramar)]"></div> : null}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-semibold">
                {error}
              </div>
            ) : null}

            <div className="mt-7 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={submit}
                disabled={isSubmitting}
                className={`btn-ochre px-4 py-3 rounded-xl font-bold text-sm text-center flex-1 inline-flex items-center justify-center gap-2 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                <i className="fas fa-arrow-right"></i>
                {isSubmitting ? 'Saving…' : 'Continue'}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/pricing?plan=${encodeURIComponent(plan)}`)}
                className="px-4 py-3 rounded-xl font-bold text-sm text-center flex-1 border border-gray-200 bg-white/70 text-gray-800 hover:bg-white transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(PricingOnboardingPage);

