import { verifyToken } from '../config/jwt.js'
import { findById } from '../models/admin.model.js'

// Verifies the Bearer token and attaches the authenticated admin to req.admin.
export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || ''
    const [scheme, token] = header.split(' ')
    if (scheme !== 'Bearer' || !token) {
      const err = new Error('Authentication required')
      err.status = 401
      throw err
    }

    let payload
    try {
      payload = verifyToken(token)
    } catch {
      const err = new Error('Invalid or expired session. Please sign in again.')
      err.status = 401
      throw err
    }

    const admin = await findById(payload.sub)
    if (!admin || admin.status !== 'active') {
      const err = new Error('This account is no longer active.')
      err.status = 401
      throw err
    }

    req.admin = admin
    next()
  } catch (err) {
    next(err)
  }
}

// Restricts a route to one or more roles, e.g. requireRole('superadmin').
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      const err = new Error('You do not have permission to perform this action.')
      err.status = 403
      return next(err)
    }
    return next()
  }
}
