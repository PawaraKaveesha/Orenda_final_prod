import bcrypt from 'bcryptjs'
import * as adminModel from '../models/admin.model.js'
import { asyncHandler, notFoundError } from '../utils/asyncHandler.js'
import { requireFields } from '../utils/validate.js'
import { ok, created, noContent } from '../utils/response.js'

export const listAdmins = asyncHandler(async (_req, res) => {
  ok(res, await adminModel.findAllPublic())
})

export const getAdmin = asyncHandler(async (req, res) => {
  const admin = await adminModel.findById(req.params.id)
  if (!admin) throw notFoundError('Admin not found')
  ok(res, admin)
})

export const createAdmin = asyncHandler(async (req, res) => {
  requireFields(req.body, ['full_name', 'email', 'password'])
  if (String(req.body.password).length < 8) {
    const err = new Error('Password must be at least 8 characters')
    err.status = 400
    throw err
  }
  const password_hash = await bcrypt.hash(req.body.password, 10)
  created(res, await adminModel.create({ ...req.body, password_hash }))
})

export const updateAdmin = asyncHandler(async (req, res) => {
  const admin = await adminModel.update(req.params.id, req.body)
  if (!admin) throw notFoundError('Admin not found')
  ok(res, admin)
})

export const deleteAdmin = asyncHandler(async (req, res) => {
  const admin = await adminModel.remove(req.params.id)
  if (!admin) throw notFoundError('Admin not found')
  noContent(res)
})
