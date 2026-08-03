// Vercel serverless function — iTunes Search API CORS proxy.
// Auto-deployed by Vercel from this file's location (api/search.js).
// Endpoint: GET /api/search?q=<term>&limit=<n>
//
// The browser cannot call itunes.apple.com directly: on mobile the response
// redirects to the custom scheme "musics://" (to open Apple Music), which
// the browser blocks. A server-to-server fetch from Vercel uses a non-mobile
// User-Agent, so iTunes returns JSON. The function also adds the CORS
// headers the browser requires, validates and rate-limits the input, and
// sets an edge-cache TTL so repeat searches don't re-hit iTunes.

import { applyCors, isOriginAllowed } from './_lib/cors.js'
import { checkRateLoose } from './_lib/ratelimit.js'

const MAX_QUERY_LENGTH = 200
const MAX_LIMIT = 20
const MIN_LIMIT = 1
const DEFAULT_LIMIT = 8
const CONTROL_CHARS = /[\x00-\x1F\x7F]/

export default async function handler(req, res) {
  applyCors(req, res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!isOriginAllowed(req)) {
    return res.status(403).json({ error: 'Origin not allowed' })
  }

  const rate = checkRateLoose(req)
  if (!rate.ok) {
    res.setHeader('Retry-After', String(rate.retryAfter))
    return res.status(429).json({ error: 'Too many requests', retryAfter: rate.retryAfter })
  }

  const q = req.query.q
  if (typeof q !== 'string' || q.length === 0 || q.length > MAX_QUERY_LENGTH) {
    return res.status(400).json({ error: 'Invalid q' })
  }
  if (CONTROL_CHARS.test(q)) {
    return res.status(400).json({ error: 'Invalid q' })
  }

  let limit = parseInt(req.query.limit, 10)
  if (!Number.isFinite(limit)) limit = DEFAULT_LIMIT
  limit = Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, limit))

  const itunesUrl =
    'https://itunes.apple.com/search?term=' +
    encodeURIComponent(q) +
    '&entity=song&media=music&limit=' +
    limit

  try {
    const upstream = await fetch(itunesUrl, {
      headers: {
        // Desktop UA so iTunes never tries to redirect to musics://
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      },
    })
    const data = await upstream.text()
    res.setHeader('Content-Type', upstream.headers.get('Content-Type') || 'application/json')
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=86400')
    return res.status(upstream.status).send(data)
  } catch (e) {
    return res.status(502).json({ error: 'Upstream fetch failed' })
  }
}
