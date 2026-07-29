// Vercel serverless function — iTunes Search API CORS proxy.
// Auto-deployed by Vercel from this file's location (api/search.js).
// Endpoint: GET /api/search?q=<term>&limit=<n>
//
// The browser cannot call itunes.apple.com directly: on mobile the response
// redirects to the custom scheme "musics://" (to open Apple Music), which
// the browser blocks. A server-to-server fetch from Vercel uses a non-mobile
// User-Agent, so iTunes returns JSON. The function also adds the CORS
// headers the browser requires and sets an edge-cache TTL so repeat
// searches don't re-hit iTunes.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const q = req.query.q;
  const limit = req.query.limit || '8';

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing q' });
  }

  const itunesUrl =
    'https://itunes.apple.com/search?term=' +
    encodeURIComponent(q) +
    '&entity=song&media=music&limit=' +
    encodeURIComponent(limit);

  try {
    const upstream = await fetch(itunesUrl, {
      headers: {
        // Desktop UA so iTunes never tries to redirect to musics://
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      },
    });
    const data = await upstream.text();
    res.setHeader('Content-Type', upstream.headers.get('Content-Type') || 'application/json');
    res.setHeader('Cache-Control', 's-maxage=600');
    return res.status(upstream.status).send(data);
  } catch (e) {
    return res.status(502).json({ error: 'Upstream fetch failed' });
  }
}
