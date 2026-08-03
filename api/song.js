// Vercel serverless function — song request form proxy.
// Validates payload, rate-limits per IP, then forwards to Google Apps Script
// with the server-only token. The Apps Script URL is no longer public.

import { applyCors, isOriginAllowed } from './_lib/cors.js'
import { checkRate } from './_lib/ratelimit.js'
import { validateSong } from './_lib/validate.js'
import { forwardToAppsScript } from './_lib/forwardToAppsScript.js'

export default async function handler(req, res) {
  applyCors(req, res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!isOriginAllowed(req)) {
    return res.status(403).json({ error: 'Origin not allowed' })
  }

  const sheetUrl = process.env.VITE_SONG_SHEET_URL
  const token = process.env.VITE_SONG_SERVER_TOKEN
  if (!sheetUrl || !token) {
    console.error('song: missing VITE_SONG_SHEET_URL or VITE_SONG_SERVER_TOKEN')
    return res.status(500).json({ error: 'Server misconfigured' })
  }

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  const errors = validateSong(body)
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors })
  }

  const rate = checkRate(req)
  if (!rate.ok) {
    res.setHeader('Retry-After', String(rate.retryAfter))
    return res.status(429).json({ error: 'Too many requests', retryAfter: rate.retryAfter })
  }

  try {
    const timestamp = new Date().toISOString()
    const author = body.author
    const dedication = body.dedication

    const results = await Promise.allSettled(
      body.songs.map((s, i) => {
        const row = {
          Timestamp: timestamp,
          Cancion: `${s.name} — ${s.artist}`,
          Artista: s.artist,
          Album: s.album,
          TrackId: s.trackId || '',
          Dedicatoria: i === 0 ? dedication : '',
          Quien: author,
        }
        return forwardToAppsScript(sheetUrl, token, row)
      })
    )

    const okCount = results.filter((r) => r.status === 'fulfilled').length
    if (okCount === 0) {
      return res.status(502).json({ error: 'Upstream failed' })
    }
    if (okCount < body.songs.length) {
      return res.status(207).json({ ok: true, partial: true, sent: okCount, total: body.songs.length })
    }
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('song: upstream error', e?.message)
    return res.status(502).json({ error: 'Upstream failed' })
  }
}
