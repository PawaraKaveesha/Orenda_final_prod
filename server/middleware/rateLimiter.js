import rateLimit from 'express-rate-limit'
import logger from '../utils/logger.js'

// Global API limiter — generous default for a public read-heavy site.
export const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  limit: Number(process.env.RATE_LIMIT_MAX || 300),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
})

// Upload limiter for image endpoints.
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many uploads, please try again later.' },
})

export function logRateLimited(req, _res, next) {
  logger.warn(`Rate limit hit: ${req.ip} ${req.method} ${req.originalUrl}`)
  next()
}
