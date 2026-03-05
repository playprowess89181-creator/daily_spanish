export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return Response.json({ error: 'Stripe is not configured' }, { status: 500 });
    }

    const url = new URL(request.url);
    const sessionId = url.searchParams.get('session_id') || '';
    if (!sessionId) {
      return Response.json({ error: 'Missing session_id' }, { status: 400 });
    }

    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
      },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return Response.json({ error: data?.error?.message || 'Stripe error' }, { status: 500 });
    }

    return Response.json(
      {
        id: data?.id,
        status: data?.status,
        payment_status: data?.payment_status,
        mode: data?.mode,
      },
      { status: 200 }
    );
  } catch {
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}

