'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CardCvcElement, CardExpiryElement, CardNumberElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import ProfileNavbar from '../components/ProfileNavbar';
import { useAuth, withAuth } from '../../lib/AuthContext';
import { useCart } from '../../lib/CartContext';

type PlanKey = 'monthly' | 'yearly';
type PaymentMethod = 'stripe' | 'paypal';

const PAYPAL_PENDING_SUBSCRIPTION_ID_KEY = 'paypal_pending_subscription_id';

function formatUsd(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function useStripeClient(enabled: boolean) {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    if (!enabled) {
      setStripe(null);
      setIsLoading(false);
      setLoadError('');
      return () => {
        cancelled = true;
      };
    }

    if (!publishableKey) {
      setStripe(null);
      setIsLoading(false);
      setLoadError('Stripe is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and restart the dev server.');
      return () => {
        cancelled = true;
      };
    }

    setIsLoading(true);
    setLoadError('');

    loadStripe(publishableKey)
      .then((s) => {
        if (cancelled) return;
        if (!s) {
          setStripe(null);
          setLoadError('Unable to initialize Stripe.');
          return;
        }
        setStripe(s);
      })
      .catch(() => {
        if (cancelled) return;
        setStripe(null);
        setLoadError('Unable to load Stripe.js. Allow https://js.stripe.com or disable your blocker.');
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, publishableKey]);

  return { stripe, isLoading, loadError };
}

function isLikelyPayPalSubscriptionId(value: string) {
  return value.trim().toUpperCase().startsWith('I-');
}

type StripeCardFormProps = {
  plan: PlanKey;
  customerEmail: string;
  customerName: string;
  isSubmitting: boolean;
  setIsSubmitting: (next: boolean) => void;
  setError: (next: string) => void;
  setMessage: (next: string) => void;
  onPaid: (paymentIntentId: string) => void;
};

function StripeCardForm({
  plan,
  customerEmail,
  customerName,
  isSubmitting,
  setIsSubmitting,
  setError,
  setMessage,
  onPaid,
}: StripeCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [cardholderName, setCardholderName] = useState(customerName);
  const [cardError, setCardError] = useState('');
  const [complete, setComplete] = useState({ number: false, expiry: false, cvc: false });

  const canSubmit =
    !!stripe &&
    !!elements &&
    !isSubmitting &&
    cardholderName.trim().length > 0 &&
    complete.number &&
    complete.expiry &&
    complete.cvc;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || isSubmitting) return;

    setError('');
    setMessage('');
    setCardError('');

    const name = cardholderName.trim();
    if (!name) {
      const nextError = 'Enter the name on the card.';
      setCardError(nextError);
      setError(nextError);
      return;
    }

    const cardNumberEl = elements.getElement(CardNumberElement);
    if (!cardNumberEl) {
      const nextError = 'Card input is not ready yet. Please try again.';
      setCardError(nextError);
      setError(nextError);
      return;
    }

    setIsSubmitting(true);
    try {
      const pmResult = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumberEl,
        billing_details: {
          name,
          email: customerEmail || undefined,
        },
      });

      if (pmResult.error || !pmResult.paymentMethod?.id) {
        const nextError = pmResult.error?.message || 'Unable to validate card details.';
        setCardError(nextError);
        setError(nextError);
        return;
      }

      const res = await fetch('/api/payments/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_key: plan,
          payment_method_id: pmResult.paymentMethod.id,
          email: customerEmail,
          name,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.client_secret) {
        throw new Error(data?.error || 'Unable to start Stripe payment.');
      }

      const confirm = await stripe.confirmCardPayment(String(data.client_secret), {
        payment_method: pmResult.paymentMethod.id,
      });
      if (confirm.error) {
        const nextError = confirm.error.message || 'Payment failed. Please try again.';
        setCardError(nextError);
        setError(nextError);
        return;
      }

      const intent = confirm.paymentIntent;
      const status = String(intent?.status || '').toLowerCase();
      if (status === 'succeeded' || status === 'processing') {
        setMessage('Payment successful.');
        onPaid(String(intent?.id || ''));
        return;
      }

      setMessage(`Payment status: ${intent?.status || 'unknown'}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
      <div>
        <div className="text-xs font-extrabold text-gray-700">Name on card</div>
        <input
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:border-[var(--azul-ultramar)]"
          placeholder="Jane Doe"
          autoComplete="cc-name"
        />
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="rounded-2xl border border-gray-200 bg-white/80 px-4 py-3">
          <div className="text-[11px] font-extrabold text-gray-600">Card number</div>
          <div className="mt-2">
            <CardNumberElement
              options={{
                showIcon: true,
                style: {
                  base: { fontSize: '16px', color: '#111827' },
                  invalid: { color: '#dc2626' },
                },
              }}
              onChange={(e) => {
                setComplete((prev) => ({ ...prev, number: e.complete }));
                setCardError(e.error?.message || '');
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-gray-200 bg-white/80 px-4 py-3">
            <div className="text-[11px] font-extrabold text-gray-600">Expiry</div>
            <div className="mt-2">
              <CardExpiryElement
                options={{
                  style: {
                    base: { fontSize: '16px', color: '#111827' },
                    invalid: { color: '#dc2626' },
                  },
                }}
                onChange={(e) => {
                  setComplete((prev) => ({ ...prev, expiry: e.complete }));
                  setCardError(e.error?.message || '');
                }}
              />
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white/80 px-4 py-3">
            <div className="text-[11px] font-extrabold text-gray-600">CVC</div>
            <div className="mt-2">
              <CardCvcElement
                options={{
                  style: {
                    base: { fontSize: '16px', color: '#111827' },
                    invalid: { color: '#dc2626' },
                  },
                }}
                onChange={(e) => {
                  setComplete((prev) => ({ ...prev, cvc: e.complete }));
                  setCardError(e.error?.message || '');
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {cardError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-semibold">{cardError}</div>
      ) : null}

      <button
        type="submit"
        disabled={!canSubmit}
        className={`btn-ochre w-full px-4 py-3 rounded-xl font-bold text-sm text-center inline-flex items-center justify-center gap-2 ${
          !canSubmit ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        <i className="fas fa-lock"></i>
        {isSubmitting ? 'Processing…' : 'Pay now'}
      </button>
    </form>
  );
}

function PaymentPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();
  const { lines: cartLines, subtotal: cartSubtotal } = useCart();

  const plan = ((params.get('plan') || 'monthly').toLowerCase() as PlanKey) || 'monthly';
  const level = params.get('level') || '';
  const provider = (params.get('provider') || '').toLowerCase();
  const status = (params.get('status') || '').toLowerCase();
  const stripeSessionId = params.get('session_id') || '';
  const stripePaymentIntentId = params.get('payment_intent') || '';
  const paypalToken = params.get('subscription_id') || params.get('token') || params.get('ba_token') || '';

  const [method, setMethod] = useState<PaymentMethod>('stripe');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState('');

  const lastMessage = useRef('');
  const lastError = useRef('');
  const lastStripeLoadError = useRef('');

  const [popup, setPopup] = useState<{ kind: 'success' | 'error' | 'info'; title: string; message: string } | null>(null);

  const totalAmount = plan === 'yearly' ? 197 : 25;
  const subtotal = totalAmount;
  const tax = 0;
  const total = subtotal + tax;

  const planLabel = useMemo(() => (plan === 'yearly' ? 'Annual' : 'Monthly'), [plan]);
  const invoiceNumber = useMemo(() => `DS-${Date.now().toString(36).toUpperCase()}`, []);
  const issuedOn = useMemo(
    () => new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date()),
    [],
  );

  const { stripe: stripeClient, isLoading: isStripeLoading, loadError: stripeLoadError } = useStripeClient(method === 'stripe');

  useEffect(() => {
    if (!message || message === lastMessage.current) return;
    lastMessage.current = message;
    const lower = message.toLowerCase();
    const kind = lower.includes('successful') ? 'success' : lower.includes('cancel') ? 'info' : lower.includes('failed') ? 'error' : 'info';
    const title = kind === 'success' ? 'Payment successful' : kind === 'error' ? 'Payment failed' : 'Payment update';
    setPopup({ kind, title, message });
  }, [message]);

  useEffect(() => {
    if (!error || error === lastError.current) return;
    lastError.current = error;
    setPopup({ kind: 'error', title: 'Payment failed', message: error });
  }, [error]);

  useEffect(() => {
    if (!stripeLoadError || stripeLoadError === lastStripeLoadError.current) return;
    lastStripeLoadError.current = stripeLoadError;
    setPopup({ kind: 'error', title: 'Stripe unavailable', message: stripeLoadError });
  }, [stripeLoadError]);

  useEffect(() => {
    if (!popup) return;
    const t = window.setTimeout(() => setPopup(null), 6500);
    return () => window.clearTimeout(t);
  }, [popup]);

  useEffect(() => {
    const verify = async () => {
      setError('');

      if (status !== 'success') {
        if (status === 'cancel') {
          setMessage('Payment cancelled.');
          try {
            sessionStorage.removeItem(PAYPAL_PENDING_SUBSCRIPTION_ID_KEY);
            localStorage.removeItem(PAYPAL_PENDING_SUBSCRIPTION_ID_KEY);
          } catch {}
        }
        return;
      }

      if (provider === 'stripe' && stripeSessionId) {
        setMessage('Confirming Stripe payment…');
        const res = await fetch(`/api/payments/stripe/verify?session_id=${encodeURIComponent(stripeSessionId)}`, {
          method: 'GET',
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data?.error || 'Unable to verify Stripe payment');
          setMessage('');
          return;
        }
        const paid = data?.payment_status === 'paid';
        setMessage(paid ? 'Payment successful.' : 'Payment pending. You can refresh this page.');
        return;
      }

      if (provider === 'stripe' && stripePaymentIntentId) {
        setMessage('Confirming Stripe payment…');
        const res = await fetch(`/api/payments/stripe/verify-intent?payment_intent=${encodeURIComponent(stripePaymentIntentId)}`, {
          method: 'GET',
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data?.error || 'Unable to verify Stripe payment');
          setMessage('');
          return;
        }
        const ok = String(data?.status || '').toLowerCase() === 'succeeded';
        setMessage(ok ? 'Payment successful.' : `Stripe status: ${data?.status || 'unknown'}`);
        return;
      }

      if (provider === 'paypal') {
        let storedSubscriptionId = '';
        try {
          storedSubscriptionId =
            sessionStorage.getItem(PAYPAL_PENDING_SUBSCRIPTION_ID_KEY) || localStorage.getItem(PAYPAL_PENDING_SUBSCRIPTION_ID_KEY) || '';
        } catch {}
        const subscriptionId = isLikelyPayPalSubscriptionId(paypalToken)
          ? paypalToken
          : isLikelyPayPalSubscriptionId(storedSubscriptionId)
            ? storedSubscriptionId
            : '';
        if (!subscriptionId) return;
        setMessage('Confirming PayPal payment…');
        const res = await fetch(`/api/payments/paypal/verify?subscription_id=${encodeURIComponent(subscriptionId)}`, {
          method: 'GET',
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data?.error || 'Unable to verify PayPal payment');
          setMessage('');
          return;
        }
        const ok = String(data?.status || '').toLowerCase() === 'active';
        setMessage(ok ? 'Payment successful.' : `PayPal status: ${data?.status || 'unknown'}`);
        if (ok) {
          try {
            sessionStorage.removeItem(PAYPAL_PENDING_SUBSCRIPTION_ID_KEY);
            localStorage.removeItem(PAYPAL_PENDING_SUBSCRIPTION_ID_KEY);
          } catch {}
        }
        return;
      }

      setMessage('Payment completed. You can continue.');
    };

    void verify();
  }, [provider, status, stripePaymentIntentId, stripeSessionId, paypalToken]);

  const startStripeCheckout = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/payments/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_key: plan }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) throw new Error(data?.error || 'Unable to start Stripe checkout');
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to start Stripe checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startPayPal = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/payments/paypal/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_key: plan }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.approval_url) throw new Error(data?.error || 'Unable to start PayPal checkout');
      if (typeof data?.subscription_id === 'string' && data.subscription_id.length > 0) {
        try {
          sessionStorage.setItem(PAYPAL_PENDING_SUBSCRIPTION_ID_KEY, data.subscription_id);
        } catch {}
      }
      window.location.href = data.approval_url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to start PayPal checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaid = (paymentIntentId: string) => {
    const next = new URLSearchParams(params.toString());
    next.set('provider', 'stripe');
    next.set('status', 'success');
    if (paymentIntentId) next.set('payment_intent', paymentIntentId);
    router.replace(`/payment?${next.toString()}`);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #86C2A8 0%, #F4D0D0 50%, #F25A37 100%)',
      }}
    >
      {popup ? (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setPopup(null)} aria-label="Close" />
          <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-white/80 shadow-2xl overflow-hidden">
            <div
              className={`h-1.5 ${
                popup.kind === 'success' ? 'bg-emerald-500' : popup.kind === 'error' ? 'bg-red-500' : 'bg-[var(--azul-ultramar)]'
              }`}
            />
            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div
                  className={`h-11 w-11 rounded-2xl border flex items-center justify-center flex-none ${
                    popup.kind === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : popup.kind === 'error'
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-blue-200 bg-blue-50 text-[var(--azul-ultramar)]'
                  }`}
                >
                  <i className={popup.kind === 'success' ? 'fas fa-check' : popup.kind === 'error' ? 'fas fa-exclamation' : 'fas fa-info'}></i>
                </div>
                <div className="min-w-0">
                  <div className="text-gray-900 font-extrabold text-base">{popup.title}</div>
                  <div className="mt-1 text-sm text-gray-700 font-semibold break-words">{popup.message}</div>
                </div>
                <button
                  type="button"
                  className="ml-auto h-9 w-9 rounded-xl border border-gray-200 bg-white/70 text-gray-700 hover:bg-white transition-colors flex items-center justify-center flex-none"
                  onClick={() => setPopup(null)}
                  aria-label="Close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="mt-5 flex gap-2.5">
                <button type="button" onClick={() => setPopup(null)} className="btn-mint flex-1 px-4 py-3 rounded-xl font-bold text-sm text-center">
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
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
                  Invoice
                </div>
                <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">Subscription invoice</h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-3xl">Pay your {planLabel} subscription to start learning.</p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white/70 px-4 py-3 text-right">
                <div className="text-[11px] font-semibold text-gray-600">Amount due</div>
                <div className="text-gray-900 font-extrabold text-lg">{formatUsd(total)} USD</div>
                {level ? <div className="mt-1 text-[11px] font-semibold text-gray-600">Level: {level}</div> : null}
              </div>
            </div>

            <div className="mt-6"></div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-3xl border border-gray-200 bg-white/75 p-5 sm:p-6 shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-gray-900 font-extrabold text-lg">Invoice</div>
                    <div className="mt-1 text-sm text-gray-600">Invoice #{invoiceNumber}</div>
                    <div className="mt-1 text-sm text-gray-600">Issued {issuedOn}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-gray-700">Amount due</div>
                    <div className="mt-1 text-gray-900 font-extrabold text-xl">{formatUsd(total)}</div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-gray-200 bg-white/80 px-4 py-4">
                  <div className="text-xs font-extrabold text-gray-700">Billed to</div>
                  <div className="mt-2 text-sm font-semibold text-gray-900">{user?.name || user?.nickname || 'Daily Spanish member'}</div>
                  <div className="mt-1 text-sm text-gray-700">{user?.email || ''}</div>
                </div>

                {cartLines.length > 0 ? (
                  <div className="mt-6 rounded-2xl border border-gray-200 bg-white/80 px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-xs font-extrabold text-gray-700">Cart items</div>
                      <div className="text-xs font-extrabold text-gray-700">{formatUsd(cartSubtotal)}</div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {cartLines.map((line) => (
                        <div key={line.id} className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-sm font-extrabold text-gray-900">
                              {line.name} <span className="text-gray-600 font-semibold">× {line.quantity}</span>
                            </div>
                            {line.description ? <div className="mt-1 text-sm text-gray-700">{line.description}</div> : null}
                          </div>
                          <div className="w-20 text-right text-sm font-extrabold text-gray-900">{formatUsd(line.price * line.quantity)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-6 rounded-2xl border border-gray-200 bg-white/80 px-4 py-4">
                  <div className="flex items-center justify-between text-xs font-extrabold text-gray-700">
                    <div>Description</div>
                    <div className="w-20 text-right">Amount</div>
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-extrabold text-gray-900">Daily Spanish — {planLabel} subscription</div>
                      <div className="mt-1 text-sm text-gray-700">Renews every {plan === 'yearly' ? 'year' : 'month'}</div>
                      {level ? <div className="mt-1 text-sm text-gray-700">Suggested level: {level}</div> : null}
                    </div>
                    <div className="w-20 text-right text-sm font-extrabold text-gray-900">{formatUsd(subtotal)}</div>
                  </div>

                  <div className="mt-5 border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-700 font-semibold">
                      <div>Subtotal</div>
                      <div>{formatUsd(subtotal)}</div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-700 font-semibold">
                      <div>Tax</div>
                      <div>{formatUsd(tax)}</div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-900 font-extrabold">
                      <div>Total</div>
                      <div>{formatUsd(total)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white/75 p-5 sm:p-6 shadow-md">
                <div className="text-gray-900 font-extrabold text-lg">Pay invoice</div>
                <div className="mt-2 text-sm text-gray-600">Choose a method and complete payment.</div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMethod('stripe')}
                    className={`text-left rounded-2xl border px-4 py-4 transition-colors ${
                      method === 'stripe' ? 'border-[var(--azul-ultramar)] bg-white' : 'border-gray-200 bg-white/70 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-gray-900 font-extrabold">Credit card</div>
                        <div className="mt-1 text-sm text-gray-600">Pay with Stripe</div>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center flex-none ${
                          method === 'stripe' ? 'border-[var(--azul-ultramar)]' : 'border-gray-300'
                        }`}
                      >
                        {method === 'stripe' ? <div className="h-2.5 w-2.5 rounded-full bg-[var(--azul-ultramar)]"></div> : null}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('paypal')}
                    className={`text-left rounded-2xl border px-4 py-4 transition-colors ${
                      method === 'paypal' ? 'border-[var(--azul-ultramar)] bg-white' : 'border-gray-200 bg-white/70 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-gray-900 font-extrabold">PayPal</div>
                        <div className="mt-1 text-sm text-gray-600">Pay with PayPal</div>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center flex-none ${
                          method === 'paypal' ? 'border-[var(--azul-ultramar)]' : 'border-gray-300'
                        }`}
                      >
                        {method === 'paypal' ? <div className="h-2.5 w-2.5 rounded-full bg-[var(--azul-ultramar)]"></div> : null}
                      </div>
                    </div>
                  </button>
                </div>

                {method === 'stripe' ? (
                  stripeLoadError ? (
                    <div className="mt-5 space-y-3">
                      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 font-semibold">
                        {stripeLoadError}
                      </div>
                      <button
                        type="button"
                        onClick={startStripeCheckout}
                        disabled={isSubmitting}
                        className={`btn-ochre w-full px-4 py-3 rounded-xl font-bold text-sm text-center inline-flex items-center justify-center gap-2 ${
                          isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        <i className="fas fa-arrow-right"></i>
                        {isSubmitting ? 'Starting…' : 'Continue to Stripe Checkout'}
                      </button>
                    </div>
                  ) : isStripeLoading ? (
                    <div className="mt-5 rounded-2xl border border-gray-200 bg-white/80 px-4 py-4 text-sm text-gray-700 font-semibold">
                      Loading secure payment form…
                    </div>
                  ) : stripeClient ? (
                    <Elements stripe={stripeClient}>
                      <StripeCardForm
                        plan={plan}
                        customerEmail={user?.email || ''}
                        customerName={user?.name || user?.nickname || ''}
                        isSubmitting={isSubmitting}
                        setIsSubmitting={setIsSubmitting}
                        setError={setError}
                        setMessage={setMessage}
                        onPaid={handlePaid}
                      />
                    </Elements>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-gray-200 bg-white/80 px-4 py-4 text-sm text-gray-700 font-semibold">
                      Payment form is unavailable right now.
                    </div>
                  )
                ) : (
                  <div className="mt-5">
                    <div className="rounded-2xl border border-gray-200 bg-white/80 px-4 py-4 text-sm text-gray-700 font-semibold">
                      You will be redirected to PayPal to confirm your subscription.
                    </div>
                    <button
                      type="button"
                      onClick={startPayPal}
                      disabled={isSubmitting}
                      className={`mt-4 btn-ochre w-full px-4 py-3 rounded-xl font-bold text-sm text-center inline-flex items-center justify-center gap-2 ${
                        isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      <i className="fab fa-paypal"></i>
                      {isSubmitting ? 'Starting…' : 'Continue to PayPal'}
                    </button>
                  </div>
                )}

                <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => router.push(`/pricing/placement-test?plan=${encodeURIComponent(plan)}`)}
                    className="px-4 py-3 rounded-xl font-bold text-sm text-center flex-1 border border-gray-200 bg-white/70 text-gray-800 hover:bg-white transition-colors"
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>

            {status === 'success' ? (
              <div className="mt-7">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="btn-mint w-full px-4 py-3 rounded-xl font-bold text-sm text-center inline-flex items-center justify-center gap-2"
                >
                  <i className="fas fa-arrow-right"></i>
                  Continue to dashboard
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(PaymentPage);
