import { getStats } from '../models/dashboard.model.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ok } from '../utils/response.js'

export const getDashboardStats = asyncHandler(async (_req, res) => {
  ok(res, await getStats())
})
