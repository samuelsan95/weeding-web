// Payload validation for the two form endpoints.
// All limits are defense-in-depth: client already enforces maxlength and
// Number constraints, but we never trust the wire.

const CONTROL_CHARS = /[\x00-\x1F\x7F]/

function isString(v) {
  return typeof v === 'string'
}

function isBoundedString(v, min, max) {
  return isString(v) && v.length >= min && v.length <= max && !CONTROL_CHARS.test(v)
}

export function validateConfirmation(body) {
  if (!body || typeof body !== 'object') return ['body must be an object']

  if (!isBoundedString(body.name, 1, 100)) return ['name invalid']
  if (!['Sí', 'No'].includes(body.attending)) return ['attending invalid']

  if (!Number.isInteger(body.adults) || body.adults < 0 || body.adults > 20) {
    return ['adults invalid']
  }
  if (!Number.isInteger(body.children) || body.children < 0 || body.children > 20) {
    return ['children invalid']
  }

  if (!isString(body.allergies) || body.allergies.length > 500 || CONTROL_CHARS.test(body.allergies)) {
    return ['allergies invalid']
  }

  return []
}

export function validateSong(body) {
  if (!body || typeof body !== 'object') return ['body must be an object']

  if (!isString(body.dedication) || body.dedication.length > 500 || CONTROL_CHARS.test(body.dedication)) {
    return ['dedication invalid']
  }
  if (!isString(body.author) || body.author.length > 100 || CONTROL_CHARS.test(body.author)) {
    return ['author invalid']
  }

  if (!Array.isArray(body.songs) || body.songs.length < 1 || body.songs.length > 3) {
    return ['songs count invalid']
  }

  for (const song of body.songs) {
    if (!song || typeof song !== 'object') return ['song must be an object']
    if (!isBoundedString(song.name, 1, 200)) return ['song name invalid']
    if (!isString(song.artist) || song.artist.length > 200 || CONTROL_CHARS.test(song.artist)) {
      return ['song artist invalid']
    }
    if (!isString(song.album) || song.album.length > 200 || CONTROL_CHARS.test(song.album)) {
      return ['song album invalid']
    }
    if (song.trackId !== null && !isBoundedString(song.trackId, 1, 64)) {
      return ['song trackId invalid']
    }
  }

  return []
}
