export function requireFields(body, fields) {
  const missing = fields.filter(
    (field) => body[field] === undefined || body[field] === null || String(body[field]).trim() === '',
  )
  if (missing.length > 0) {
    const err = new Error(`Missing required fields: ${missing.join(', ')}`)
    err.status = 400
    throw err
  }
}

export function parsePositiveNumber(value, field, min = 0) {
  const num = Number(value)
  if (!Number.isFinite(num) || num <= min) {
    const err = new Error(`${field} must be a number greater than ${min}`)
    err.status = 400
    throw err
  }
  return num
}
