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

type TestQuestion = {
  id: string;
  title: string;
  options: Array<{ label: string; value: string }>;
};

function PlacementTestPage() {
  const router = useRouter();
  const params = useSearchParams();
  const plan = ((params.get('plan') || 'monthly').toLowerCase() as PlanKey) || 'monthly';

  const questions = useMemo<TestQuestion[]>(
    () => [
      {
        id: 'q1',
        title: 'Choose the correct form: Yo ___ estudiante.',
        options: [
          { label: 'soy', value: 'soy' },
          { label: 'eres', value: 'eres' },
          { label: 'es', value: 'es' },
          { label: 'somos', value: 'somos' },
        ],
      },
      {
        id: 'q2',
        title: 'Choose the correct verb: Yo ___ 25 años.',
        options: [
          { label: 'tengo', value: 'tengo' },
          { label: 'soy', value: 'soy' },
          { label: 'hago', value: 'hago' },
          { label: 'estoy', value: 'estoy' },
        ],
      },
      {
        id: 'q3',
        title: 'Choose the correct preposition: Vivo ___ Madrid.',
        options: [
          { label: 'en', value: 'en' },
          { label: 'a', value: 'a' },
          { label: 'de', value: 'de' },
          { label: 'con', value: 'con' },
        ],
      },
      {
        id: 'q4',
        title: 'Choose the correct verb: Yo ___ aprender español.',
        options: [
          { label: 'quiero', value: 'quiero' },
          { label: 'quieres', value: 'quieres' },
          { label: 'quiere', value: 'quiere' },
          { label: 'queremos', value: 'queremos' },
        ],
      },
      {
        id: 'q5',
        title: 'Choose the correct past tense: Ayer yo ___ al museo.',
        options: [
          { label: 'fui', value: 'fui' },
          { label: 'voy', value: 'voy' },
          { label: 'iba', value: 'iba' },
          { label: 'he ido', value: 'he ido' },
        ],
      },
      {
        id: 'q6',
        title: 'Choose the correct form: Ahora ___ en casa.',
        options: [
          { label: 'estoy', value: 'estoy' },
          { label: 'soy', value: 'soy' },
          { label: 'fui', value: 'fui' },
          { label: 'seré', value: 'seré' },
        ],
      },
      {
        id: 'q7',
        title: 'Choose the correct conjugation: Nosotros ___ español.',
        options: [
          { label: 'hablamos', value: 'hablamos' },
          { label: 'hablo', value: 'hablo' },
          { label: 'hablas', value: 'hablas' },
          { label: 'hablan', value: 'hablan' },
        ],
      },
      {
        id: 'q8',
        title: 'Choose the infinitive: Voy a ___ un café.',
        options: [
          { label: 'comprar', value: 'comprar' },
          { label: 'compro', value: 'compro' },
          { label: 'compré', value: 'compré' },
          { label: 'comprando', value: 'comprando' },
        ],
      },
      {
        id: 'q9',
        title: 'Choose the correct connector: No voy ___ estoy cansado.',
        options: [
          { label: 'porque', value: 'porque' },
          { label: 'pero', value: 'pero' },
          { label: 'aunque', value: 'aunque' },
          { label: 'si', value: 'si' },
        ],
      },
      {
        id: 'q10',
        title: 'Choose the correct word: ___ tengo clase.',
        options: [
          { label: 'mañana', value: 'mañana' },
          { label: 'ayer', value: 'ayer' },
          { label: 'noche', value: 'noche' },
          { label: 'tarde', value: 'tarde' },
        ],
      },
    ],
    []
  );

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; suggested_level: string } | null>(null);

  const submit = async () => {
    if (isSubmitting) return;
    setError('');

    const missing = questions.filter((q) => !answers[q.id]).map((q) => q.id);
    if (missing.length) {
      setError('Please answer all questions before validating.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      plan_key: plan,
      answers: questions.map((q) => ({ id: q.id, value: answers[q.id] })),
    };

    const attempt = async (token: string) => {
      return fetch(`${API_BASE_URL}/subscription/placement-test/`, {
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
        throw new Error(data?.error || 'Unable to submit test');
      }

      setResult({ score: data.score, total: data.total, suggested_level: data.suggested_level });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to submit test');
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
        <div className="max-w-5xl mx-auto">
          <div className="glass-effect rounded-3xl shadow-2xl p-6 sm:p-10 border border-white/20">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-gray-700">
                  <span className="h-2 w-2 rounded-full bg-[var(--amarillo-ocre)] shadow-[0_0_0_6px_rgba(236,164,0,0.14)]"></span>
                  Discover your level
                </div>
                <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">Short Spanish test</h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-3xl">
                  Answer these questions, then validate. Daily Spanish will suggest your learning level and take you to payment.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white/70 px-4 py-3 text-right">
                <div className="text-[11px] font-semibold text-gray-600">Selected plan</div>
                <div className="text-gray-900 font-extrabold">{plan === 'yearly' ? 'Annual' : 'Monthly'}</div>
              </div>
            </div>

            {result ? (
              <div className="mt-8 rounded-3xl border border-gray-200 bg-white/75 p-5 sm:p-6 shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-gray-900 font-extrabold text-lg">Suggested level: {result.suggested_level}</div>
                    <div className="mt-1 text-gray-600 text-sm">
                      Score: {result.score}/{result.total}
                    </div>
                    <div className="mt-3 text-gray-700 text-sm font-semibold">Accept your suggested level to continue.</div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/payment?plan=${encodeURIComponent(plan)}&level=${encodeURIComponent(result.suggested_level)}`)
                    }
                    className="btn-ochre px-4 py-3 rounded-xl font-bold text-sm text-center inline-flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-check"></i>
                    Accept & Pay
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
                {questions.map((q) => (
                  <div key={q.id} className="rounded-3xl border border-gray-200 bg-white/75 p-5 sm:p-6 shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-gray-900 font-extrabold">{q.title}</div>
                      <div className="text-[11px] font-extrabold text-gray-600 rounded-full border border-gray-200 bg-white/70 px-2.5 py-1">
                        {q.id.toUpperCase()}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt) => {
                        const selected = answers[q.id] === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.value }))}
                            className={`text-left rounded-2xl border px-4 py-3 transition-colors ${
                              selected ? 'border-[var(--azul-ultramar)] bg-white' : 'border-gray-200 bg-white/70 hover:bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-gray-800 font-semibold text-sm">{opt.label}</div>
                              <div
                                className={`h-5 w-5 rounded-full border flex items-center justify-center flex-none ${
                                  selected ? 'border-[var(--azul-ultramar)]' : 'border-gray-300'
                                }`}
                              >
                                {selected ? <div className="h-2.5 w-2.5 rounded-full bg-[var(--azul-ultramar)]"></div> : null}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-semibold">
                {error}
              </div>
            ) : null}

            {!result ? (
              <div className="mt-7 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={submit}
                  disabled={isSubmitting}
                  className={`btn-ochre px-4 py-3 rounded-xl font-bold text-sm text-center flex-1 inline-flex items-center justify-center gap-2 ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  <i className="fas fa-check-circle"></i>
                  {isSubmitting ? 'Validating…' : 'Validate'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/pricing/onboarding?plan=${encodeURIComponent(plan)}`)}
                  className="px-4 py-3 rounded-xl font-bold text-sm text-center flex-1 border border-gray-200 bg-white/70 text-gray-800 hover:bg-white transition-colors"
                >
                  Back
                </button>
              </div>
            ) : (
              <div className="mt-7 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setAnswers({});
                    setError('');
                  }}
                  className="px-4 py-3 rounded-xl font-bold text-sm text-center flex-1 border border-gray-200 bg-white/70 text-gray-800 hover:bg-white transition-colors"
                >
                  Retake test
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/pricing/onboarding?plan=${encodeURIComponent(plan)}`)}
                  className="px-4 py-3 rounded-xl font-bold text-sm text-center flex-1 border border-gray-200 bg-white/70 text-gray-800 hover:bg-white transition-colors"
                >
                  Back
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(PlacementTestPage);
