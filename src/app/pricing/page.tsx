'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ProfileNavbar from '../components/ProfileNavbar';
import { withAuth } from '../../lib/AuthContext';

type PlanKey = 'monthly' | 'yearly';

type Plan = {
  key: PlanKey;
  name: string;
  price: number;
  cadence: string;
  highlight?: boolean;
  badge?: string;
  description: string;
  bullets: string[];
};

const PLANS: Plan[] = [
  {
    key: 'monthly',
    name: 'Monthly',
    price: 25,
    cadence: 'Monthly billing',
    description: 'Stay flexible and build your learning habit week by week.',
    bullets: ['Full access to lessons and exercises', 'Progress tracking in your dashboard', 'Cancel anytime'],
  },
  {
    key: 'yearly',
    name: 'Annual',
    price: 197,
    cadence: 'Annual billing',
    highlight: true,
    badge: 'Best value',
    description: 'Save with one payment and commit to consistent progress.',
    bullets: ['Everything in Monthly', 'Lower effective monthly price', 'Cancel anytime'],
  },
];

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

function PricingPage() {
  const yearlyComparedToMonthly = 25 * 12;
  const yearlySavings = yearlyComparedToMonthly - 197;
  const yearlyPerMonth = 197 / 12;
  const router = useRouter();
  const [buying, setBuying] = useState<PlanKey | null>(null);
  const [error, setError] = useState('');

  const handleBuy = async (planKey: PlanKey) => {
    if (buying) return;
    setBuying(planKey);
    setError('');
    const accessToken = getAccessToken();
    if (!accessToken) {
      router.push('/login');
      return;
    }

    const fetchStatus = async (token: string) => {
      return fetch(`${API_BASE_URL}/subscription/status/`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    };

    try {
      let res = await fetchStatus(accessToken);
      if (res.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          const retryToken = getAccessToken();
          if (retryToken) {
            res = await fetchStatus(retryToken);
          }
        }
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Unable to start purchase flow');
      }

      const firstTime = Boolean(data?.first_time_payment);
      const planParam = encodeURIComponent(planKey);
      if (firstTime) {
        router.push(`/pricing/onboarding?plan=${planParam}`);
      } else {
        router.push(`/cart?plan=${planParam}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to start purchase flow');
    } finally {
      setBuying(null);
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
        <div className="max-w-6xl mx-auto">
          <div className="glass-effect rounded-3xl shadow-2xl p-6 sm:p-10 border border-white/20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-gray-700">
                  <span className="h-2 w-2 rounded-full bg-[var(--amarillo-ocre)] shadow-[0_0_0_6px_rgba(236,164,0,0.14)]"></span>
                  Professional plans for consistent learning
                </div>

                <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">Pricing</h1>
                <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-2xl">
                  Choose the subscription that fits your pace. Add it to your cart, review the legal details, then buy securely.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white/70 px-4 py-3">
                    <div className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-none">
                      <i className="fas fa-shield-alt text-[var(--azul-ultramar)]"></i>
                    </div>
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900">Secure billing</div>
                      <div className="text-gray-600 text-xs sm:text-sm">Receipts in dashboard</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white/70 px-4 py-3">
                    <div className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-none">
                      <i className="fas fa-calendar-times text-[var(--azul-ultramar)]"></i>
                    </div>
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900">Cancel anytime</div>
                      <div className="text-gray-600 text-xs sm:text-sm">No hidden fees</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white/70 px-4 py-3">
                    <div className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-none">
                      <i className="fas fa-headset text-[var(--azul-ultramar)]"></i>
                    </div>
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900">Support</div>
                      <div className="text-gray-600 text-xs sm:text-sm">Help when needed</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-3xl border border-gray-200 bg-white/75 p-5 sm:p-6 shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-gray-600 text-xs font-semibold">Annual value</div>
                      <div className="mt-1 text-gray-900 text-lg font-extrabold">Save ${yearlySavings}</div>
                      <div className="mt-1 text-gray-600 text-sm">vs. paying monthly for 12 months</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-900 text-3xl font-extrabold leading-none">${yearlyPerMonth.toFixed(2)}</div>
                      <div className="mt-1 text-gray-600 text-xs font-semibold">USD / month</div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-gray-200 bg-white/70 px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center mt-0.5 flex-none">
                        <i className="fas fa-info-circle text-[var(--azul-ultramar)]"></i>
                      </div>
                      <div>
                        <div className="text-gray-900 font-semibold text-sm">Pricing currency</div>
                        <div className="text-sm text-gray-600 mt-1">All prices on this page are shown in USD.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {PLANS.map((plan) => (
                <div
                  key={plan.key}
                  className={`relative rounded-3xl p-[1px] shadow-lg ${
                    plan.highlight ? 'bg-gradient-to-br from-[var(--amarillo-ocre)] via-white to-[var(--naranja)]' : 'bg-gradient-to-br from-gray-200 via-white to-gray-200'
                  }`}
                >
                  <div className="rounded-3xl bg-white/80 border border-white/50 p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-gray-900 text-xl font-extrabold">{plan.name}</div>
                          {plan.badge ? (
                            <div className="rounded-full bg-[var(--amarillo-ocre)] text-white text-[11px] font-extrabold px-2.5 py-1">
                              {plan.badge}
                            </div>
                          ) : null}
                        </div>
                        <div className="mt-2 text-gray-600 text-sm">{plan.description}</div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Link
                          href={`/cart?plan=${encodeURIComponent(plan.key)}`}
                          aria-label={`Add ${plan.name} subscription to cart`}
                          className="h-10 w-10 rounded-xl border border-gray-200 bg-white/70 hover:bg-white flex items-center justify-center transition-colors"
                        >
                          <i className="fas fa-cart-plus text-[var(--azul-ultramar)]"></i>
                        </Link>
                      </div>
                    </div>

                    <div className="mt-6 flex items-end justify-between gap-4">
                      <div>
                        <div className="text-gray-600 text-xs font-semibold">Package name and price</div>
                        <div className="mt-1 text-gray-900 text-4xl font-extrabold leading-none">
                          ${plan.price}
                          <span className="text-sm text-gray-600 font-semibold ml-2">USD</span>
                        </div>
                        <div className="mt-2 text-gray-600 text-sm">{plan.cadence}</div>
                      </div>

                      {plan.key === 'yearly' ? (
                        <div className="text-right">
                          <div className="text-[11px] text-gray-700 rounded-full border border-gray-200 bg-white/70 px-2.5 py-1 font-semibold inline-flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-[var(--verde-menta)]"></span>
                            ${yearlyPerMonth.toFixed(2)}/mo
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-6 space-y-2">
                      {plan.bullets.map((item) => (
                        <div key={item} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-3 py-2">
                          <div className="h-7 w-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-none">
                            <i className="fas fa-check text-[var(--verde-menta)] text-sm"></i>
                          </div>
                          <div className="text-gray-800 font-semibold text-sm leading-snug">{item}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 rounded-2xl border border-gray-200 bg-white/70 px-4 py-3">
                      <div className="text-gray-900 font-semibold text-sm">Legal information</div>
                      <div className="mt-1 text-sm text-gray-600">
                        By purchasing, you agree to the{' '}
                        <Link href="/legal-notice" className="font-semibold text-[var(--azul-ultramar)] hover:underline">
                          terms and conditions
                        </Link>
                        , the{' '}
                        <Link href="/legal-notice" className="font-semibold text-[var(--azul-ultramar)] hover:underline">
                          applicable legal basis
                        </Link>
                        , and the{' '}
                        <Link href="/legal-notice" className="font-semibold text-[var(--azul-ultramar)] hover:underline">
                          privacy policy
                        </Link>
                        .
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => handleBuy(plan.key)}
                        disabled={buying !== null}
                        className={`${plan.highlight ? 'btn-ochre' : 'btn-mint'} w-full px-4 py-3 rounded-xl font-bold text-sm text-center inline-flex items-center justify-center gap-2 ${
                          buying ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        <i className="fas fa-credit-card"></i>
                        {buying === plan.key ? 'Loading…' : 'Buy'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {error ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-semibold">
                {error}
              </div>
            ) : null}

            <div className="mt-10 text-center text-xs sm:text-sm text-gray-600">
              Cancel anytime. No hidden fees. Pricing shown in USD.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(PricingPage);

