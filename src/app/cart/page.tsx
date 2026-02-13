'use client';

import React, { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ProfileNavbar from '../components/ProfileNavbar';
import { withAuth } from '../../lib/AuthContext';
import { useCart } from '../../lib/CartContext';

type PlanKey = 'monthly' | 'yearly';

const PLANS: Record<
  PlanKey,
  {
    key: PlanKey;
    name: string;
    cadence: string;
    price: number;
    subtitle: string;
  }
> = {
  monthly: { key: 'monthly', name: 'Monthly', cadence: 'per month', price: 25, subtitle: 'Flexible plan to build a habit' },
  yearly: { key: 'yearly', name: 'Annual', cadence: 'per year', price: 197, subtitle: 'Best value for long-term progress' },
};

function CartInner() {
  const params = useSearchParams();
  const { lines, setQuantity, removeFromCart, clearCart, subtotal } = useCart();

  const planParam = params.get('plan');
  const selected = (planParam || '').toLowerCase() as PlanKey;
  const plan = planParam ? (PLANS[selected] || PLANS.monthly) : null;
  const paymentHref = useMemo(() => `/payment?plan=${encodeURIComponent(plan?.key || 'monthly')}`, [plan?.key]);

  const summary = useMemo(() => {
    const monthlyTotal = 25 * 12;
    const yearlySavings = monthlyTotal - 197;
    const showSavings = plan?.key === 'yearly';
    return {
      showSavings,
      yearlySavings,
      yearlyPerMonth: 197 / 12,
    };
  }, [plan?.key]);

  const cartTotal = useMemo(() => {
    const planTotal = plan ? plan.price : 0;
    return subtotal + planTotal;
  }, [plan, subtotal]);

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
          <div className="glass-effect rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-gray-700">
                  <span className="h-2 w-2 rounded-full bg-[var(--amarillo-ocre)] shadow-[0_0_0_6px_rgba(236,164,0,0.14)]"></span>
                  Review your cart
                </div>
                <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">Cart</h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-xl">
                  Add products and services from the offer page, then review everything here.
                </p>
              </div>

              <Link
                href="/products"
                className="w-full lg:w-auto px-4 py-3 rounded-xl font-bold text-sm text-center border border-gray-200 bg-white/70 text-gray-800 hover:bg-white transition-colors"
              >
                Continue shopping
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7">
                <div className="rounded-3xl border border-gray-200 bg-white/75 p-5 sm:p-6 shadow-md">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-gray-900 font-extrabold">Products & services</div>
                    {lines.length > 0 ? (
                      <button
                        type="button"
                        onClick={clearCart}
                        className="text-xs font-bold rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-gray-700 hover:bg-white transition-colors"
                      >
                        Clear
                      </button>
                    ) : null}
                  </div>

                  {lines.length === 0 ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-white/60 px-4 py-5">
                      <div className="text-gray-900 font-extrabold">Your cart is empty</div>
                      <div className="mt-1 text-sm text-gray-600">Browse the offer and add anything you want.</div>
                      <div className="mt-4">
                        <Link href="/products" className="btn-gradient text-white px-4 py-2.5 rounded-xl font-bold text-sm inline-flex">
                          Explore products
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {lines.map((line) => (
                        <div key={line.id} className="rounded-2xl border border-gray-200 bg-white/70 px-4 py-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="text-gray-900 font-extrabold">{line.name}</div>
                                <div className="text-[11px] font-semibold rounded-full border border-gray-200 bg-white/70 px-2.5 py-1 text-gray-700">
                                  {line.kind}
                                </div>
                              </div>
                              <div className="mt-1 text-sm text-gray-700">{line.description}</div>
                              <div className="mt-2 text-sm font-semibold text-gray-800">${line.price} each</div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3">
                              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-2 py-2">
                                <button
                                  type="button"
                                  onClick={() => setQuantity(line.id, line.quantity - 1)}
                                  className="h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 transition-colors"
                                  aria-label="Decrease quantity"
                                >
                                  <i className="fas fa-minus text-xs"></i>
                                </button>
                                <div className="min-w-10 text-center font-extrabold text-gray-900">{line.quantity}</div>
                                <button
                                  type="button"
                                  onClick={() => setQuantity(line.id, line.quantity + 1)}
                                  className="h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 transition-colors"
                                  aria-label="Increase quantity"
                                >
                                  <i className="fas fa-plus text-xs"></i>
                                </button>
                              </div>
                              <div className="text-right">
                                <div className="text-gray-900 font-extrabold">${(line.price * line.quantity).toFixed(2)}</div>
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(line.id)}
                                  className="mt-1 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {plan ? (
                  <div className="mt-5 rounded-3xl border border-gray-200 bg-white/75 p-5 sm:p-6 shadow-md">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-gray-600 text-xs font-semibold">Selected plan</div>
                        <div className="mt-1 text-gray-900 text-lg font-extrabold">{plan.name}</div>
                        <div className="mt-1 text-gray-600 text-sm">{plan.subtitle}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-900 text-3xl font-extrabold leading-none">${plan.price}</div>
                        <div className="mt-1 text-gray-600 text-xs font-semibold">{plan.cadence}</div>
                      </div>
                    </div>

                    {summary.showSavings && (
                      <div className="mt-4 rounded-2xl border border-gray-200 bg-white/70 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-gray-900 font-semibold text-sm">You save ${summary.yearlySavings}</div>
                          <div className="text-[11px] text-gray-700 rounded-full border border-gray-200 bg-white/70 px-2.5 py-1 font-semibold">
                            ${summary.yearlyPerMonth.toFixed(2)}/mo
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-3 py-2">
                        <div className="h-7 w-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-none">
                          <i className="fas fa-lock text-[var(--azul-ultramar)] text-sm"></i>
                        </div>
                        <div className="text-gray-800 font-semibold text-sm leading-snug">Secure checkout</div>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-3 py-2">
                        <div className="h-7 w-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-none">
                          <i className="fas fa-undo text-[var(--azul-ultramar)] text-sm"></i>
                        </div>
                        <div className="text-gray-800 font-semibold text-sm leading-snug">Cancel anytime</div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
                      <Link href={paymentHref} className="btn-ochre px-4 py-3 rounded-xl font-bold text-sm text-center flex-1">
                        Go to payment
                      </Link>
                      <Link href="/dashboard" className="btn-mint px-4 py-3 rounded-xl font-bold text-sm text-center flex-1">
                        Back
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-3xl border border-gray-200 bg-white/75 p-5 sm:p-6 shadow-md">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-gray-900 font-extrabold">Add a subscription</div>
                        <div className="mt-1 text-sm text-gray-600">
                          Choose a plan if you’d like full access to lessons and exercises.
                        </div>
                      </div>
                      <Link
                        href="/pricing"
                        className="px-4 py-2.5 rounded-xl font-bold text-sm text-center border border-gray-200 bg-white/70 text-gray-800 hover:bg-white transition-colors"
                      >
                        View plans
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-3xl border border-gray-200 bg-white/75 p-5 sm:p-6 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="text-gray-900 font-extrabold">Order summary</div>
                    <div className="text-[11px] text-gray-600 font-semibold">USD</div>
                  </div>

                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between text-gray-700">
                      <div>Products & services</div>
                      <div>${subtotal.toFixed(2)}</div>
                    </div>
                    {plan ? (
                      <div className="flex items-center justify-between text-gray-700">
                        <div>Subscription</div>
                        <div>${plan.price.toFixed(2)}</div>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between text-gray-700">
                      <div>Tax</div>
                      <div>Calculated at checkout</div>
                    </div>

                    <div className="h-px bg-gray-200"></div>

                    <div className="flex items-center justify-between text-gray-900">
                      <div className="font-extrabold">Total</div>
                      <div className="font-extrabold">${cartTotal.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <Link href={paymentHref} className="btn-ochre w-full px-4 py-3 rounded-xl font-bold text-sm text-center inline-flex items-center justify-center gap-2">
                      <i className="fas fa-credit-card"></i>
                      Checkout
                    </Link>
                    {!plan ? (
                      <div className="mt-2 text-xs text-gray-600 font-semibold">
                        Checkout defaults to the Monthly plan unless you choose another.
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-5 rounded-2xl border border-gray-200 bg-white/70 px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center mt-0.5 flex-none">
                        <i className="fas fa-info-circle text-[var(--azul-ultramar)]"></i>
                      </div>
                      <div>
                        <div className="text-gray-900 font-semibold text-sm">Next step</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Connect this page to your payment provider when you’re ready.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #86C2A8 0%, #F4D0D0 50%, #F25A37 100%)',
          }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      }
    >
      <CartInner />
    </Suspense>
  );
}

export default withAuth(CartPage);
