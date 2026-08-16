import * as bookingModel from '../models/booking.model.js'
import { asyncHandler, notFoundError } from '../utils/asyncHandler.js'
import { requireFields, parsePositiveNumber } from '../utils/validate.js'
import { ok, created } from '../utils/response.js'

export const listBookings = asyncHandler(async (_req, res) => {
  ok(res, await bookingModel.findAll())
})

export const createBooking = asyncHandler(async (req, res) => {
  requireFields(req.body, ['guest_name', 'email', 'villa_id', 'check_in', 'check_out', 'guests'])
  const body = { ...req.body }
  if (body.total_price !== undefined) {
    body.total_price = parsePositiveNumber(body.total_price, 'total_price', -1)
  }
  created(res, await bookingModel.create(body))
})

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const booking = await bookingModel.updateStatus(req.params.id, req.body.status)
  if (!booking) throw notFoundError('Booking not found')
  ok(res, booking)
})
