// Vercel serverless function — confirmation form proxy.
// Validates payload, rate-limits per IP, then forwards to Google Apps Script
// with the server-only token. The Apps Script URL is no longer public.

import { applyCors, isOriginAllowed } from './_lib/cors.js'
import { checkRate } from './_lib/ratelimit.js'
import { validateConfirmation } from './_lib/validate.js'
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

  const sheetUrl = process.env.CONFIRMATION_SHEET_URL
  const token = process.env.CONFIRMATION_SERVER_TOKEN
  if (!sheetUrl || !token) {
    console.error('confirm: missing CONFIRMATION_SHEET_URL or CONFIRMATION_SERVER_TOKEN')
    return res.status(500).json({ error: 'Server misconfigured' })
  }

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  const errors = validateConfirmation(body)
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors })
  }

  const rate = checkRate(req)
  if (!rate.ok) {
    res.setHeader('Retry-After', String(rate.retryAfter))
    return res.status(429).json({ error: 'Too many requests', retryAfter: rate.retryAfter })
  }

  try {
    const forwarded = {
      Timestamp: new Date().toISOString(),
      'Nombre y apellidos': body.name,
      Asistira: body.attending,
      Adultos: body.attending === 'Sí' ? String(body.adults) : 'N/A',
      Niños: body.attending === 'Sí' ? String(body.children) : 'N/A',
      'Alergias/Intolerancias': body.attending === 'Sí' ? body.allergies : 'N/A',
    }
    await forwardToAppsScript(sheetUrl, token, forwarded)
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('confirm: upstream error', e?.message)
    return res.status(502).json({ error: 'Upstream failed' })
  }
}
