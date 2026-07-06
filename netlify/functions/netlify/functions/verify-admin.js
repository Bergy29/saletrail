exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ granted: false, error: 'Method not allowed' }) };
  let body; try { body = JSON.parse(event.body || '{}'); } catch (e) { body = {}; }
  const submitted = body.code || '';
  const adminCode = process.env.ADMIN_CODE;
  if (!adminCode) return { statusCode: 500, body: JSON.stringify({ granted: false, error: 'Server not configured. Set ADMIN_CODE in Netlify environment variables.' }) };
  await new Promise((r) => setTimeout(r, 700));
  if (submitted.length !== adminCode.length || submitted !== adminCode) return { statusCode: 401, body: JSON.stringify({ granted: false }) };
  return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ granted: true }) };
};
