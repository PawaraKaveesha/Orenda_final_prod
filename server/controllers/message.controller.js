import * as messageModel from '../models/message.model.js'
import { asyncHandler, notFoundError } from '../utils/asyncHandler.js'
import { requireFields } from '../utils/validate.js'
import { ok, created } from '../utils/response.js'

export const listMessages = asyncHandler(async (_req, res) => {
  ok(res, await messageModel.findAll())
})

export const createMessage = asyncHandler(async (req, res) => {
  requireFields(req.body, ['sender_name', 'email', 'subject', 'body'])
  created(res, await messageModel.create(req.body))
})

export const markMessageRead = asyncHandler(async (req, res) => {
  const read = req.body.read === true
  const message = await messageModel.markRead(req.params.id, read)
  if (!message) throw notFoundError('Message not found')
  ok(res, message)
})
