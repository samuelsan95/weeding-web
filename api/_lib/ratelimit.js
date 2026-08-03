// In-memory rate limiter, keyed by hashed IP.
// Two tiers:
//   1) 1 request / 30s (anti double-click, anti accidental loops)
//   2) 5 requests / 10 min (anti spam)
//
// Caveat: state is per lambda instance. Vercel may cold-start at any time
// and reset the Map. For ~100 wedding guests this is acceptable.

import { createHash } from 'node:crypto'

const DEFAULT_COOLDOWN_MS = 30 * 1000
const DEFAULT_WINDOW_MS = 10 * 60 * 1000
const DEFAULT_MAX_PER_WINDOW = 5
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

export function checkRate(req, options = {}) {
  const cooldownMs = options.cooldownMs ?? DEFAULT_COOLDOWN_MS
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS
  const maxPerWindow = options.maxPerWindow ?? DEFAULT_MAX_PER_WINDOW

  const ip = getClientIp(req)
  const key = hashIp(ip)
  const now = Date.now()

  const arr = buckets.get(key) || []
  const recent = arr.filter((t) => now - t < windowMs)

  if (cooldownMs > 0 && recent.length > 0 && now - recent[recent.length - 1] < cooldownMs) {
    const retryAfter = Math.ceil(
      (cooldownMs - (now - recent[recent.length - 1])) / 1000
    )
    return { ok: false, retryAfter, tier: 'cooldown' }
  }

  if (recent.length >= maxPerWindow) {
    const oldest = recent[0]
    const retryAfter = Math.ceil((windowMs - (now - oldest)) / 1000)
    return { ok: false, retryAfter, tier: 'window' }
  }

  recent.push(now)
  buckets.set(key, recent)
  return { ok: true }
}

const LOOSE_WINDOW_MS = 60 * 1000
const LOOSE_MAX_PER_WINDOW = 30

export function checkRateLoose(req) {
  const ip = getClientIp(req)
  const key = hashIp(ip)
  const now = Date.now()

  const arr = buckets.get(key) || []
  const recent = arr.filter((t) => now - t < LOOSE_WINDOW_MS)

  if (recent.length >= LOOSE_MAX_PER_WINDOW) {
    const oldest = recent[0]
    const retryAfter = Math.ceil((LOOSE_WINDOW_MS - (now - oldest)) / 1000)
    return { ok: false, retryAfter, tier: 'window' }
  }

  recent.push(now)
  buckets.set(key, recent)
  return { ok: true }
}
