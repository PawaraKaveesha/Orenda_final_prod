import bcrypt from 'bcryptjs'
import * as adminModel from '../models/admin.model.js'
import { signToken } from '../config/jwt.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ok } from '../utils/response.js'

const SALT_ROUNDS = 10

function publicAdmin(admin) {
  if (!admin) return null
  const obj = typeof admin.toObject === 'function' ? admin.toObject() : admin
  const { password_hash: _hash, _id, __v, ...safe } = obj
  return safe
}

function issueSession(admin) {
  const token = signToken({ sub: admin.admin_id, email: admin.email, role: admin.role })
  return { token, admin: publicAdmin(admin) }
}

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    const err = new Error('Email and password are required')
    err.status = 400
    throw err
  }

  const inputEmail = String(email).toLowerCase().trim()
  const inputPassword = String(password)

  const envEmail = process.env.ADMIN_EMAIL ? String(process.env.ADMIN_EMAIL).toLowerCase().trim() : null
  const envPassword = process.env.ADMIN_PASSWORD ? String(process.env.ADMIN_PASSWORD) : null

  let admin = null

  // 1. Authenticate against server-side environment variables ADMIN_EMAIL and ADMIN_PASSWORD
  if (envEmail && envPassword && inputEmail === envEmail && inputPassword === envPassword) {
    admin = await adminModel.findByEmail(envEmail)
    if (!admin) {
      const hash = await bcrypt.hash(inputPassword, SALT_ROUNDS)
      admin = await adminModel.create({
        full_name: 'Orenda Administrator',
        email: envEmail,
        password_hash: hash,
        role: 'superadmin',
      })
    }
  } else {
    // 2. Fallback: Authenticate against MongoDB hashed credentials if not matching env vars
    const dbAdmin = await adminModel.findByEmail(inputEmail)
    if (dbAdmin && dbAdmin.status === 'active') {
      const valid = await bcrypt.compare(inputPassword, dbAdmin.password_hash)
      if (valid) {
        admin = dbAdmin
      }
    }
  }

  if (!admin || admin.status === 'disabled') {
    const err = new Error('Invalid email or password')
    err.status = 401
    throw err
  }

  await adminModel.touchLogin(admin.admin_id)
  ok(res, issueSession(admin))
})

// POST /api/auth/logout — stateless JWT, client discards token.
export const logout = asyncHandler(async (_req, res) => {
  ok(res, { message: 'Signed out successfully' })
})

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  const admin = await adminModel.findById(req.admin.admin_id)
  ok(res, publicAdmin(admin))
})

// POST /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    const err = new Error('Current password and new password are required')
    err.status = 400
    throw err
  }
  if (String(newPassword).length < 8) {
    const err = new Error('New password must be at least 8 characters')
    err.status = 400
    throw err
  }

  const admin = await adminModel.findByEmail(req.admin.email)
  const valid = await bcrypt.compare(String(currentPassword), admin.password_hash)
  if (!valid) {
    const err = new Error('Current password is incorrect')
    err.status = 400
    throw err
  }
  if (await bcrypt.compare(String(newPassword), admin.password_hash)) {
    const err = new Error('New password must be different from the current one')
    err.status = 400
    throw err
  }

  const hash = await bcrypt.hash(String(newPassword), SALT_ROUNDS)
  const updated = await adminModel.updatePassword(admin.admin_id, hash)
  ok(res, { message: 'Password updated successfully', admin: publicAdmin(updated) })
})
