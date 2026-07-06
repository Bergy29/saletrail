exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ found: false, error: 'Method not allowed' }) };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch (e) { body = {}; }
  const email = (body.email || '').trim().toLowerCase();

  if (!email || !email.includes('@')) {
    return { statusCode: 400, body: JSON.stringify({ found: false, error: 'Enter a valid email address' }) };
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return { statusCode: 500, body: JSON.stringify({ found: false, error: 'Server not configured. Set STRIPE_SECRET_KEY in Netlify environment variables.' }) };
  }

  await new Promise((r) => setTimeout(r, 500));

  try {
    const custResp = await fetch('https://api.stripe.com/v1/customers?email=' + encodeURIComponent(email) + '&limit=1', {
      headers: { Authorization: 'Bearer ' + secretKey }
    });
    const custData = await custResp.json();
    if (!custResp.ok || !custData.data || custData.data.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ found: false, error: 'No account found with that email' }) };
    }
    const customerId = custData.data[0].id;

    const subResp = await fetch('https://api.stripe.com/v1/subscriptions?customer=' + encodeURIComponent(customerId) + '&status=active&limit=1', {
      headers: { Authorization: 'Bearer ' + secretKey }
    });
    const subData = await subResp.json();
    if (!subResp.ok || !subData.data || subData.data.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ found: false, error: 'No active subscription found with that email' }) };
    }

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ found: true, subscriptionId: subData.data[0].id })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ found: false, error: 'Lookup request failed' }) };
  }
};
