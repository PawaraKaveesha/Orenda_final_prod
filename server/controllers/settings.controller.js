import * as settingsModel from '../models/settings.model.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ok } from '../utils/response.js'

// GET /api/settings/public
export const getPublicSettings = asyncHandler(async (_req, res) => {
  ok(res, await settingsModel.findPublicMap())
})

// GET /api/settings
export const getSettings = asyncHandler(async (_req, res) => {
  ok(res, await settingsModel.findAll())
})

// PUT /api/settings — expects { settings: [{ key, value }, ...] }
export const updateSettings = asyncHandler(async (req, res) => {
  const entries = Array.isArray(req.body) ? req.body : req.body.settings
  if (!Array.isArray(entries) || entries.length === 0) {
    const err = new Error('Provide a settings array: [{ key, value }]')
    err.status = 400
    throw err
  }
  await settingsModel.upsertMany(entries)
  ok(res, await settingsModel.findAll())
})
