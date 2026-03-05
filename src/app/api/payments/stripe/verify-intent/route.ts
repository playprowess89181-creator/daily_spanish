export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return Response.json({ error: 'Stripe is not configured' }, { status: 500 });
    }

    const url = new URL(request.url);
    const paymentIntentId = url.searchParams.get('payment_intent') || '';
    if (!paymentIntentId) {
      return Response.json({ error: 'Missing payment_intent' }, { status: 400 });
    }

    const res = await fetch(`https://api.stripe.com/v1/payment_intents/${encodeURIComponent(paymentIntentId)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${stripeSecretKey}` },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return Response.json({ error: data?.error?.message || 'Stripe error' }, { status: 500 });
    }

    return Response.json(
      {
        id: data?.id,
        status: data?.status,
        amount: data?.amount,
        currency: data?.currency,
      },
      { status: 200 }
    );
  } catch {
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}

