import logger from '../utils/logger.js'

// Centralized error handler — always returns { success: false, message }.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err.status >= 500 || !err.status) {
    logger.error(err.stack || err.message)
  }

  // Multer errors
  if (err instanceof Error && err.message && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File is too large.' })
  }
  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: err.message })
  }

  // MongoDB / Mongoose driver errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: 'One of the provided values violates a constraint.' })
  }
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'A record with that value already exists.' })
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'One of the provided values has an invalid format.' })
  }

  const status = err.status || 500
  const message = status === 500 ? 'Internal server error' : err.message
  return res.status(status).json({ success: false, message })
}
