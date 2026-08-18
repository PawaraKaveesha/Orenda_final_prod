import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import routes from './routes/index.js'
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'
import { apiLimiter } from './middleware/rateLimiter.js'
import { sanitizeBody } from './utils/sanitize.js'
import { pool } from './config/database.js'
import logger from './utils/logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()

// Render (and other proxies) terminate TLS and forward the real client IP via
// X-Forwarded-For. This makes req.ip and the rate limiter accurate in prod.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
}

// ---- Security headers ----
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

// ---- CORS ----
// Comma-separated allowed origins. FRONTEND_URL takes precedence (Cloudflare
// Pages domain in production); CORS_ORIGIN is kept for local/back-compat.
const corsOrigins = (process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
if (process.env.NODE_ENV === 'production' && corsOrigins.includes('*')) {
  logger.warn(
    'CORS is set to "*" in production. Set FRONTEND_URL to the exact Cloudflare Pages origin.',
  )
}
app.use(cors({ origin: corsOrigins }))

// ---- Request logging ----
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }))

// ---- Body parsing + basic XSS sanitization ----
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))
app.use((req, _res, next) => {
  if (req.body && typeof req.body === 'object') req.body = sanitizeBody(req.body)
  next()
})

// ---- Static uploads + seeded images ----
app.use('/images', express.static(path.join(__dirname, 'public/images'))
app.get('/debug', (_req, res) => {
  res.json({
    frontendPath,
    cwd: process.cwd(),
    dirname: __dirname,
  })
})

// ---- Health ----
// Confirms the server is up and (without exposing any internals) whether the
// database is reachable.
app.get('/api/health', async (_req, res) => {
  let db = 'unavailable'
  try {
    await pool.query('SELECT 1')
    db = 'connected'
  } catch {
    // keep "unavailable" — never leak credentials or stack traces here
  }
  res.json({
    success: true,
    status: 'ok',
    message: 'Orenda API is healthy',
    db,
    time: new Date().toISOString(),
  })
})

// ---- Global rate limit ----
app.use('/api', apiLimiter)

// ---- API routes ----
app.use('/api', routes)

// ---- 404 + centralized errors ----
// ---- Serve frontend SPA ----
// API routes that don't exist should still go through the API 404 handler.
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next()
  }

  res.sendFile(path.join(frontendPath, 'index.html'))
})

// ---- 404 + centralized errors ----
app.use(notFound)
app.use(errorHandler)

export default app
