export default async (request, context) => {
  const country = context.geo && context.geo.country ? context.geo.country.code : null;
  if (!country) return context.next();
  if (country !== 'NZ') {
    return new Response(
      '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>SaleTrail</title><style>body{font-family:sans-serif;background:#1F3D2E;color:#F6F1E4;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;padding:24px;}div{max-width:320px;}h1{font-size:22px;}p{color:rgba(246,241,228,0.7);font-size:14px;line-height:1.5;}</style></head><body><div><h1>SaleTrail is only available in New Zealand</h1><p>This app is currently restricted to visitors browsing from within NZ.</p></div></body></html>',
      { status: 403, headers: { 'content-type': 'text/html' } }
    );
  }
  return context.next();
};
export const config = { path: '/*' };
