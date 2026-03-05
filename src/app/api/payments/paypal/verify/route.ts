export const dynamic = 'force-dynamic';

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

export async function GET(request: Request) {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID || '';
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
    if (!clientId || !clientSecret) {
      return Response.json({ error: 'PayPal is not configured' }, { status: 500 });
    }

    const url = new URL(request.url);
    const subscriptionId = url.searchParams.get('subscription_id') || '';
    if (!subscriptionId) {
      return Response.json({ error: 'Missing subscription_id' }, { status: 400 });
    }

    const baseUrl = getPayPalBaseUrl();
    const accessToken = await getPayPalAccessToken(baseUrl, clientId, clientSecret);

    const res = await fetch(`${baseUrl}/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return Response.json({ error: data?.message || 'PayPal error' }, { status: 500 });
    }

    return Response.json({ id: data?.id, status: data?.status }, { status: 200 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Internal error' }, { status: 500 });
  }
}

