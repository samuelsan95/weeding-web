// CORS allow-list helper for Vercel serverless functions.
// Production: only ALLOWED_ORIGIN is accepted.
// Development: localhost ports for vite (5173) and vite preview (4173) are added.

const DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:3000']

function getAllowedOrigins() {
  const isDev = process.env.NODE_ENV !== 'production'
  const list = []
  if (process.env.ALLOWED_ORIGIN) list.push(process.env.ALLOWED_ORIGIN)
  if (isDev) list.push(...DEV_ORIGINS)
  return list
}

export function applyCors(req, res) {
  const allowed = getAllowedOrigins()
  const origin = req.headers.origin
  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Max-Age', '86400')
}

export function isOriginAllowed(req) {
  const allowed = getAllowedOrigins()
  const origin = req.headers.origin
  if (!origin) return true
  return allowed.includes(origin)
}
