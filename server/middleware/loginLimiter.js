import logger from '../utils/logger.js'

// In-memory failed sign-in limiter.
//
// Only FAILED authentication attempts are counted (responses with status >= 400,
// excluding the 429 this middleware itself returns). A successful sign-in clears
// the counter for that identity, and the store lives in memory — so restarting the
// server can never leave an administrator permanently locked out.
//
// Keyed by `ip|email` so a lockout on one account does not block other identities.

const WINDOW_MS = 15 * 60 * 1000
const MAX_FAILED_ATTEMPTS = 5

const attempts = new Map()

function keyFor(req) {
  const email = String(req.body?.email || '').toLowerCase().trim()
  return `${req.ip || 'unknown'}|${email}`
}

function sweep(now) {
  for (const [key, record] of attempts) {
    const expired = record.blockedUntil
      ? now >= record.blockedUntil
      : now - (record.lastFailedAt || 0) > WINDOW_MS
    if (expired) attempts.delete(key)
  }
}

export function loginLimiter(req, res, next) {
  const key = keyFor(req)
  const now = Date.now()
  sweep(now)

  const record = attempts.get(key)
  if (record?.blockedUntil && now < record.blockedUntil) {
    const minutes = Math.max(1, Math.ceil((record.blockedUntil - now) / 60000))
    logger.warn(`Login rate limit hit: ${req.ip} ${req.method} ${req.originalUrl}`)
    return res.status(429).json({
      success: false,
      message: `Too many failed sign-in attempts. Please wait ${minutes} minute${
        minutes === 1 ? '' : 's'
      } and try again.`,
    })
  }

  if (record?.blockedUntil && now >= record.blockedUntil) {
    attempts.delete(key)
  }

  res.on('finish', () => {
    if (res.statusCode >= 400 && res.statusCode !== 429) {
      const current = attempts.get(key) || { count: 0, blockedUntil: 0, lastFailedAt: now }
      current.count += 1
      current.lastFailedAt = now
      if (current.count >= MAX_FAILED_ATTEMPTS) {
        current.blockedUntil = now + WINDOW_MS
        current.count = 0
      }
      attempts.set(key, current)
    } else if (res.statusCode < 400) {
      attempts.delete(key)
    }
  })

  next()
}
