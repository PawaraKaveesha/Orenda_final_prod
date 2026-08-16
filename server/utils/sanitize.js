// Lightweight XSS input sanitization. Escapes HTML-significant characters on
// all incoming string fields so stored/reflected content cannot execute scripts.
export function sanitizeValue(value) {
  if (typeof value === 'string') {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }
  return value
}

export function sanitizeBody(body) {
  if (!body || typeof body !== 'object') return body
  const out = Array.isArray(body) ? [] : {}
  for (const [key, value] of Object.entries(body)) {
    if (Array.isArray(value)) {
      out[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeValue(item) : sanitizeValue(item),
      )
    } else if (value && typeof value === 'object') {
      out[key] = sanitizeBody(value)
    } else {
      out[key] = sanitizeValue(value)
    }
  }
  return out
}
