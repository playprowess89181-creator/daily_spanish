export const dynamic = 'force-dynamic';

type PlanKey = 'monthly' | 'yearly';

function getPlanFromBody(planKey: unknown): PlanKey | null {
  if (planKey === 'monthly' || planKey === 'yearly') return planKey;
  return null;
}

function getPayPalBaseUrl() {
  const env = (process.env.PAYPAL_ENV || 'sandbox').toLowerCase();
  return env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

async function getPayPalAccessToken(baseUrl: string, clientId: string, clientSecret: string) {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.access_token) {
    throw new Error(data?.error_description || 'Unable to authenticate with PayPal');
  }
  return String(data.access_token);
}

export async function POST(request: Request) {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID || '';
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
    const planIdMonthly = process.env.PAYPAL_PLAN_ID_MONTHLY || '';
    const planIdYearly = process.env.PAYPAL_PLAN_ID_YEARLY || '';

    if (!clientId || !clientSecret) {
      return Response.json({ error: 'PayPal is not configured' }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const planKey = getPlanFromBody(body?.plan_key);
    if (!planKey) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const planId = planKey === 'yearly' ? planIdYearly : planIdMonthly;
    if (!planId) {
      return Response.json({ error: 'PayPal plan is not configured' }, { status: 500 });
    }

    const origin = request.headers.get('origin') || '';
    if (!origin) {
      return Response.json({ error: 'Missing request origin' }, { status: 400 });
    }

    const baseUrl = getPayPalBaseUrl();
    const accessToken = await getPayPalAccessToken(baseUrl, clientId, clientSecret);

    const returnUrl = `${origin}/payment?provider=paypal&status=success&plan=${encodeURIComponent(planKey)}`;
    const cancelUrl = `${origin}/payment?provider=paypal&status=cancel&plan=${encodeURIComponent(planKey)}`;

    const res = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: planId,
        application_context: {
          return_url: returnUrl,
          cancel_url: cancelUrl,
          user_action: 'SUBSCRIBE_NOW',
        },
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return Response.json({ error: data?.message || 'PayPal error' }, { status: 500 });
    }

    const approve = Array.isArray(data?.links) ? data.links.find((l: any) => l?.rel === 'approve') : null;
    if (!approve?.href) {
      return Response.json({ error: 'PayPal approval URL missing' }, { status: 500 });
    }

    return Response.json({ approval_url: approve.href, subscription_id: data?.id }, { status: 200 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Internal error' }, { status: 500 });
  }
}
