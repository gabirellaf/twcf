/**
 * TWCF Worker — serves the static site (via env.ASSETS) and handles
 * server-side Stripe payment creation.
 *
 * Two completely independent payment flows, kept deliberately separate end
 * to end so neither can affect the other's pricing or state:
 *
 *   General donations   -> /api/create-donation-intent, /api/donation-status
 *                          donate.html -> checkout.html -> complete.html
 *                          sessionStorage key: twcfDonationPayment
 *                          Stripe metadata: { type: 'donation' }
 *
 *   Kit sponsorships     -> /api/create-kit-intent, /api/kit-payment-status
 *                          sponsor.html -> kit-checkout.html -> kit-complete.html
 *                          sessionStorage key: twcfKitPayment
 *                          Stripe metadata: { type: 'kit_sponsorship', kit: <slug> }
 *
 * Kit prices live only here, server-side. The client sends a kit slug and
 * nothing else — it can never influence the charged amount.
 */

const KIT_PRICES = {
  'womens-dignity':              { amount: 3500,  name: "Sponsor a Women's Dignity Kit" },
  'baby-maternal':               { amount: 5000,  name: 'Sponsor a Baby & Maternal Care Kit' },
  'childrens-education':         { amount: 3500,  name: "Sponsor a Children's Education & Comfort Kit" },
  'family-essentials':           { amount: 3000,  name: 'Sponsor a Family Essentials Kit' },
  'teen-girls':                  { amount: 4500,  name: "Sponsor a Teen Girls' Essentials Kit" },
  'hospital-comfort':            { amount: 2000,  name: 'Sponsor a Hospital Comfort Kit for Kids' },
  'winter-warmth':               { amount: 3000,  name: 'Sponsor a Winter Warmth Kit' },
  'period-poverty':              { amount: 3000,  name: 'Sponsor a Period Poverty Kit' },
  'home-start':                  { amount: 10000, name: 'Sponsor a Home Start Kit' },
  'dzaleka-childrens-education': { amount: 1500,  name: "Sponsor a Children's Education & Comfort Kit for Dzaleka" },
  'dzaleka-baby-maternal':       { amount: 3000,  name: 'Sponsor a Baby & Maternal Care Kit for Dzaleka' },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  });
}

async function stripeFetch(env, path, method, params) {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error(
      'Stripe is not configured yet (missing STRIPE_SECRET_KEY secret).'
    );
  }

  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
    },
  };

  if (params) {
    opts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    opts.body = params.toString();
  }

  const res = await fetch(`https://api.stripe.com/v1${path}`, opts);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || 'Stripe request failed');
  }

  return data;
}

async function handleCreateDonationIntent(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const amount = Number(body?.amount);

  if (
    !Number.isInteger(amount) ||
    amount < 100 ||
    amount > 10000000
  ) {
    return json(
      { error: 'Donation amount must be between $1 and $100,000.' },
      400
    );
  }

  const params = new URLSearchParams();

  params.set('amount', String(amount));
  params.set('currency', 'usd');
  params.set(
    'description',
    'Donation to The Women and Children Foundation'
  );
  params.set(
    'automatic_payment_methods[enabled]',
    'true'
  );
  params.set(
    'metadata[type]',
    'donation'
  );

  try {
    const paymentIntent = await stripeFetch(
      env,
      '/payment_intents',
      'POST',
      params
    );

    return json({
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
    });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

async function handleCreateKitIntent(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const slug = body?.kit;
  const kit = KIT_PRICES[slug];

  if (!kit) {
    return json({ error: 'Unknown kit' }, 400);
  }

  const params = new URLSearchParams();

  params.set('amount', String(kit.amount));
  params.set('currency', 'usd');
  params.set('description', kit.name);
  params.set('automatic_payment_methods[enabled]', 'true');
  params.set('metadata[type]', 'kit_sponsorship');
  params.set('metadata[kit]', slug);

  try {
    const paymentIntent = await stripeFetch(
      env,
      '/payment_intents',
      'POST',
      params
    );

    return json({
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      kitName: kit.name,
    });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

async function handleKitPaymentStatus(request, env) {
  const url = new URL(request.url);
  const paymentIntentId = url.searchParams.get('payment_intent') || '';

  if (!/^pi_[a-zA-Z0-9_]+$/.test(paymentIntentId)) {
    return json({ error: 'Invalid payment intent id' }, 400);
  }

  try {
    const paymentIntent = await stripeFetch(
      env,
      `/payment_intents/${paymentIntentId}`,
      'GET'
    );

    if (paymentIntent.metadata?.type !== 'kit_sponsorship') {
      return json({ error: 'Not a kit sponsorship payment' }, 400);
    }

    return json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      kit: paymentIntent.metadata?.kit || null,
    });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

async function handleDonationStatus(request, env) {
  const url = new URL(request.url);
  const paymentIntentId = url.searchParams.get('payment_intent') || '';

  if (!/^pi_[a-zA-Z0-9_]+$/.test(paymentIntentId)) {
    return json({ error: 'Invalid payment intent id' }, 400);
  }

  try {
    const paymentIntent = await stripeFetch(
      env,
      `/payment_intents/${paymentIntentId}`,
      'GET'
    );

    if (paymentIntent.metadata?.type !== 'donation') {
      return json({ error: 'Not a donation payment' }, 400);
    }

    return json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });

  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (
      url.pathname === '/api/create-donation-intent' &&
      request.method === 'POST'
    ) {
      return handleCreateDonationIntent(
        request,
        env
      );
    }

    if (
      url.pathname === '/api/donation-status' &&
      request.method === 'GET'
    ) {
      return handleDonationStatus(request, env);
    }

    if (
      url.pathname === '/api/create-kit-intent' &&
      request.method === 'POST'
    ) {
      return handleCreateKitIntent(request, env);
    }

    if (
      url.pathname === '/api/kit-payment-status' &&
      request.method === 'GET'
    ) {
      return handleKitPaymentStatus(request, env);
    }

    if (url.pathname.startsWith('/api/')) {
      return json(
        { error: 'Not found' },
        404
      );
    }

    return env.ASSETS.fetch(request);
  },
};