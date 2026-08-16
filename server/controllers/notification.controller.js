import { getNotifications } from '../models/notification.model.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ok } from '../utils/response.js'

export const listNotifications = asyncHandler(async (_req, res) => {
  ok(res, await getNotifications())
})
