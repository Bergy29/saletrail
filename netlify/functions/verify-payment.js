exports.handler = async (event) => {
  const sessionId = event.queryStringParameters && event.queryStringParameters.session_id;
  if (!sessionId) return { statusCode: 400, body: JSON.stringify({ verified: false, error: 'Missing session_id' }) };
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return { statusCode: 500, body: JSON.stringify({ verified: false, error: 'Server not configured. Set STRIPE_SECRET_KEY in Netlify environment variables.' }) };
  try {
    const resp = await fetch('https://api.stripe.com/v1/checkout/sessions/' + encodeURIComponent(sessionId), { headers: { Authorization: 'Bearer ' + secretKey } });
    const session = await resp.json();
    if (!resp.ok) return { statusCode: 502, body: JSON.stringify({ verified: false, error: 'Stripe could not find that session' }) };
    const paid = session.payment_status === 'paid' || session.status === 'complete';
    return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ verified: !!paid, subscriptionId: session.subscription || null, email: (session.customer_details && session.customer_details.email) || null }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ verified: false, error: 'Verification request failed' }) };
  }
};
