// Forwards a payload to Google Apps Script with the server-side token.
// The text/plain Content-Type trick is kept so the Apps Script `doPost`
// does not need to be modified (no CORS preflight, same body shape).

export async function forwardToAppsScript(sheetUrl, token, payload) {
  const response = await fetch(sheetUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...payload, token }),
  })
  if (!response.ok) {
    throw new Error(`Apps Script responded ${response.status}`)
  }
  return response
}
