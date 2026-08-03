// In-memory rate limiter, keyed by hashed IP.
// Two tiers:
//   1) 1 request / 30s (anti double-click, anti accidental loops)
//   2) 5 requests / 10 min (anti spam)
//
// Caveat: state is per lambda instance. Vercel may cold-start at any time
// and reset the Map. For ~100 wedding guests this is acceptable.

import { createHash } from 'node:crypto'

const COOLDOWN_MS = 30 * 1000
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5
const SALT = process.env.RATELIMIT_SALT || 'wedding-static-salt'

const buckets = new Map()

function hashIp(ip) {
  return createHash('sha256').update(SALT + ip).digest('hex')
}

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for']
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0].trim()
  }
  return req.socket?.remoteAddress || 'unknown'
}

export function checkRate(req) {
  const ip = getClientIp(req)
  const key = hashIp(ip)
  const now = Date.now()

  const arr = buckets.get(key) || []
  const recent = arr.filter((t) => now - t < WINDOW_MS)

  if (recent.length > 0 && now - recent[recent.length - 1] < COOLDOWN_MS) {
    const retryAfter = Math.ceil(
      (COOLDOWN_MS - (now - recent[recent.length - 1])) / 1000
    )
    return { ok: false, retryAfter, tier: 'cooldown' }
  }

  if (recent.length >= MAX_PER_WINDOW) {
    const oldest = recent[0]
    const retryAfter = Math.ceil((WINDOW_MS - (now - oldest)) / 1000)
    return { ok: false, retryAfter, tier: 'window' }
  }

  recent.push(now)
  buckets.set(key, recent)
  return { ok: true }
}
