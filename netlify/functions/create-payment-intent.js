exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Payment not configured.' }) };
  }

  try {
    const { membershipType, name, email } = JSON.parse(event.body);

    const amounts = { general: 3500, student: 2000 };
    const amount = amounts[membershipType];
    if (!amount) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid membership type.' }) };
    }

    const params = new URLSearchParams({
      amount: amount.toString(),
      currency: 'usd',
      'metadata[membershipType]': membershipType,
      'metadata[name]': name || '',
      'metadata[email]': email || '',
    });

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const paymentIntent = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: paymentIntent.error?.message || 'Stripe error.' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error. Please try again.' }) };
  }
};
