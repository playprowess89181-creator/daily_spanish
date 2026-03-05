export const dynamic = 'force-dynamic';

type PlanKey = 'monthly' | 'yearly';

function getPlanFromBody(planKey: unknown): PlanKey | null {
  if (planKey === 'monthly' || planKey === 'yearly') return planKey;
  return null;
}

export async function POST(request: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return Response.json({ error: 'Stripe is not configured' }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const planKey = getPlanFromBody(body?.plan_key);
    if (!planKey) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const origin = request.headers.get('origin') || '';
    if (!origin) {
      return Response.json({ error: 'Missing request origin' }, { status: 400 });
    }

    const amount = planKey === 'yearly' ? 19700 : 2500;
    const interval = planKey === 'yearly' ? 'year' : 'month';
    const name = planKey === 'yearly' ? 'Daily Spanish — Annual subscription' : 'Daily Spanish — Monthly subscription';

    const successUrl = `${origin}/payment?provider=stripe&status=success&plan=${encodeURIComponent(
      planKey
    )}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/payment?provider=stripe&status=cancel&plan=${encodeURIComponent(planKey)}`;

    const form = new URLSearchParams();
    form.set('mode', 'subscription');
    form.set('success_url', successUrl);
    form.set('cancel_url', cancelUrl);
    form.set('line_items[0][quantity]', '1');
    form.set('line_items[0][price_data][currency]', 'usd');
    form.set('line_items[0][price_data][unit_amount]', String(amount));
    form.set('line_items[0][price_data][product_data][name]', name);
    form.set('line_items[0][price_data][recurring][interval]', interval);

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return Response.json({ error: data?.error?.message || 'Stripe error' }, { status: 500 });
    }

    if (!data?.url) {
      return Response.json({ error: 'Stripe session URL missing' }, { status: 500 });
    }

    return Response.json({ url: data.url }, { status: 200 });
  } catch {
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
