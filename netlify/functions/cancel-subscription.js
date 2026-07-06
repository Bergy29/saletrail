exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ cancelled: false, error: 'Method not allowed' }) };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch (e) { body = {}; }
  const subscriptionId = body.subscriptionId;

  if (!subscriptionId) {
    return { statusCode: 400, body: JSON.stringify({ cancelled: false, error: 'Missing subscriptionId' }) };
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return { statusCode: 500, body: JSON.stringify({ cancelled: false, error: 'Server not configured. Set STRIPE_SECRET_KEY in Netlify environment variables.' }) };
  }

  try {
    const resp = await fetch('https://api.stripe.com/v1/subscriptions/' + encodeURIComponent(subscriptionId), {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + secretKey,
        'content-type': 'application/x-www-form-urlencoded'
      },
      body: 'cancel_at_period_end=true'
    });
    const sub = await resp.json();

    if (!resp.ok) {
      return { statusCode: 502, body: JSON.stringify({ cancelled: false, error: (sub.error && sub.error.message) || 'Stripe could not cancel that subscription' }) };
    }

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        cancelled: true,
        endsAt: sub.current_period_end ? sub.current_period_end * 1000 : null
      })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ cancelled: false, error: 'Cancellation request failed' }) };
  }
};
