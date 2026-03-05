export const dynamic = 'force-dynamic';

type PlanKey = 'monthly' | 'yearly';

function getPlanFromBody(planKey: unknown): PlanKey | null {
  if (planKey === 'monthly' || planKey === 'yearly') return planKey;
  return null;
}

function getStringFromBody(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function getStripeId(value: unknown) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && typeof (value as any).id === 'string') return (value as any).id as string;
  return '';
}

const STRIPE_API_VERSION = '2023-10-16';

async function stripeRequest(stripeSecretKey: string, method: 'GET' | 'POST', path: string, form?: URLSearchParams) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      'Stripe-Version': STRIPE_API_VERSION,
      ...(method === 'POST' ? { 'Content-Type': 'application/x-www-form-urlencoded' } : null),
    } as Record<string, string>,
    body: method === 'POST' ? (form ? form.toString() : '') : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.error?.message || data?.message || 'Stripe error';
    throw new Error(message);
  }

  return data as any;
}

async function stripePost(stripeSecretKey: string, path: string, form?: URLSearchParams) {
  return stripeRequest(stripeSecretKey, 'POST', path, form);
}

async function stripeGet(stripeSecretKey: string, path: string) {
  return stripeRequest(stripeSecretKey, 'GET', path);
}

function createForm(fields: Array<[string, string | null | undefined]>) {
  const form = new URLSearchParams();
  for (const [key, value] of fields) {
    if (typeof value === 'string' && value.length > 0) form.set(key, value);
  }
  return form;
}

async function resolvePaymentIntentForSubscription(args: {
  stripeSecretKey: string;
  subscriptionId: string;
  invoiceId: string;
  paymentMethodId: string;
}) {
  const { stripeSecretKey, subscriptionId, invoiceId: initialInvoiceId, paymentMethodId } = args;

  let invoiceId = initialInvoiceId;
  let paymentIntentId = '';
  let invoicePayAttempted = false;
  let invoicePayError = '';
  let invoiceStatus = '';

  const refreshSubscription = async () => {
    const subscription = await stripeGet(
      stripeSecretKey,
      `subscriptions/${encodeURIComponent(subscriptionId)}?expand[]=latest_invoice&expand[]=latest_invoice.payment_intent`
    );
    invoiceId = invoiceId || getStripeId(subscription?.latest_invoice);
    paymentIntentId = paymentIntentId || getStripeId((subscription?.latest_invoice as any)?.payment_intent);
  };

  const refreshInvoice = async () => {
    if (!invoiceId) return;
    const invoice = await stripeGet(stripeSecretKey, `invoices/${encodeURIComponent(invoiceId)}?expand[]=payment_intent`);
    invoiceStatus = typeof invoice?.status === 'string' ? invoice.status : invoiceStatus;
    paymentIntentId = paymentIntentId || getStripeId(invoice?.payment_intent);
  };

  await refreshSubscription();
  if (paymentIntentId) {
    return { invoiceId, paymentIntentId, invoicePayAttempted, invoicePayError, invoiceStatus };
  }

  if (invoiceId) {
    try {
      await refreshInvoice();
    } catch {}
  }
  if (paymentIntentId) {
    return { invoiceId, paymentIntentId, invoicePayAttempted, invoicePayError, invoiceStatus };
  }

  if (invoiceId) {
    try {
      await stripePost(stripeSecretKey, `invoices/${encodeURIComponent(invoiceId)}/finalize`, new URLSearchParams());
      await refreshInvoice();
    } catch {}
  }
  if (paymentIntentId) {
    return { invoiceId, paymentIntentId, invoicePayAttempted, invoicePayError, invoiceStatus };
  }

  if (invoiceId) {
    try {
      invoicePayAttempted = true;
      const payForm = createForm([['payment_method', paymentMethodId]]);
      payForm.append('expand[]', 'payment_intent');
      const paidInvoice = await stripePost(stripeSecretKey, `invoices/${encodeURIComponent(invoiceId)}/pay`, payForm);
      invoiceStatus = typeof paidInvoice?.status === 'string' ? paidInvoice.status : invoiceStatus;
      paymentIntentId = paymentIntentId || getStripeId(paidInvoice?.payment_intent);
    } catch (e) {
      invoicePayError = e instanceof Error ? e.message : 'Unable to pay invoice';
    }
  }

  if (!paymentIntentId && invoiceId) {
    try {
      await refreshInvoice();
    } catch {}
  }
  if (paymentIntentId) {
    return { invoiceId, paymentIntentId, invoicePayAttempted, invoicePayError, invoiceStatus };
  }

  try {
    const invoices = await stripeGet(
      stripeSecretKey,
      `invoices?subscription=${encodeURIComponent(subscriptionId)}&limit=5&expand[]=data.payment_intent`
    );
    const data = Array.isArray(invoices?.data) ? invoices.data : [];
    for (const item of data) {
      const piId = getStripeId(item?.payment_intent);
      if (!piId) continue;
      invoiceId = invoiceId || getStripeId(item);
      paymentIntentId = piId;
      break;
    }
  } catch {}

  return { invoiceId, paymentIntentId, invoicePayAttempted, invoicePayError, invoiceStatus };
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

    const paymentMethodId = getStringFromBody(body?.payment_method_id);
    if (!paymentMethodId) {
      return Response.json({ error: 'Missing payment_method_id' }, { status: 400 });
    }

    const email = getStringFromBody(body?.email);
    const name = getStringFromBody(body?.name);

    const amount = planKey === 'yearly' ? 19700 : 2500;
    const interval = planKey === 'yearly' ? 'year' : 'month';
    const subscriptionName = planKey === 'yearly' ? 'Daily Spanish — Annual subscription' : 'Daily Spanish — Monthly subscription';

    const customer = await stripePost(stripeSecretKey, 'customers', createForm([['email', email], ['name', name]]));
    const customerId = getStripeId(customer);
    if (!customerId) {
      return Response.json({ error: 'Stripe customer not created' }, { status: 500 });
    }

    const attachForm = createForm([['customer', customerId]]);
    const attachResponse = await stripePost(
      stripeSecretKey,
      `payment_methods/${encodeURIComponent(paymentMethodId)}/attach`,
      attachForm
    );
    if (!getStripeId(attachResponse)) {
      return Response.json({ error: 'Stripe payment method could not be attached' }, { status: 500 });
    }

    await stripePost(
      stripeSecretKey,
      `customers/${encodeURIComponent(customerId)}`,
      createForm([['invoice_settings[default_payment_method]', paymentMethodId]])
    );

    const product = await stripePost(stripeSecretKey, 'products', createForm([['name', subscriptionName]]));
    const productId = getStripeId(product);
    if (!productId) {
      return Response.json({ error: 'Stripe product not created' }, { status: 500 });
    }

    const priceForm = createForm([
      ['product', productId],
      ['currency', 'usd'],
      ['unit_amount', String(amount)],
      ['recurring[interval]', interval],
    ]);
    const price = await stripePost(stripeSecretKey, 'prices', priceForm);
    const priceId = getStripeId(price);
    if (!priceId) {
      return Response.json({ error: 'Stripe price not created' }, { status: 500 });
    }

    const subscriptionForm = createForm([
      ['customer', customerId],
      ['payment_behavior', 'default_incomplete'],
      ['collection_method', 'charge_automatically'],
      ['payment_settings[payment_method_types][]', 'card'],
      ['payment_settings[save_default_payment_method]', 'on_subscription'],
      ['items[0][price]', priceId],
      ['default_payment_method', paymentMethodId],
    ]);
    subscriptionForm.append('expand[]', 'latest_invoice');
    subscriptionForm.append('expand[]', 'latest_invoice.payment_intent');

    const subscription = await stripePost(stripeSecretKey, 'subscriptions', subscriptionForm);
    const subscriptionId = getStripeId(subscription);
    if (!subscriptionId) {
      return Response.json({ error: 'Stripe subscription not created' }, { status: 500 });
    }

    const resolved = await resolvePaymentIntentForSubscription({
      stripeSecretKey,
      subscriptionId,
      invoiceId: getStripeId(subscription?.latest_invoice),
      paymentMethodId,
    });
    const paymentIntentId = resolved.paymentIntentId;

    if (!paymentIntentId) {
      const debug = JSON.stringify(
        {
          subscription_id: subscriptionId,
          invoice_id: resolved.invoiceId || '',
          invoice_status: resolved.invoiceStatus || '',
          invoice_pay_attempted: resolved.invoicePayAttempted,
          invoice_pay_error: resolved.invoicePayError || '',
        },
        null,
        0
      );
      return Response.json({ error: `Stripe payment intent not created. ${debug}` }, { status: 500 });
    }

    const paymentIntentDetails = await stripeGet(stripeSecretKey, `payment_intents/${encodeURIComponent(paymentIntentId)}`);
    if (!paymentIntentDetails?.client_secret) {
      return Response.json(
        {
          error: `Stripe payment intent missing client secret. ${JSON.stringify(
            { payment_intent_id: paymentIntentId, status: paymentIntentDetails?.status || '' },
            null,
            0
          )}`,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        customer_id: customerId,
        subscription_id: subscriptionId,
        payment_intent_id: paymentIntentDetails?.id,
        client_secret: paymentIntentDetails?.client_secret,
        status: paymentIntentDetails?.status,
      },
      { status: 200 }
    );
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Internal error' }, { status: 500 });
  }
}
