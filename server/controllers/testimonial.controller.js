import * as testimonialModel from '../models/testimonial.model.js'
import { asyncHandler, notFoundError } from '../utils/asyncHandler.js'
import { requireFields } from '../utils/validate.js'
import { ok, created, noContent } from '../utils/response.js'

export const listTestimonials = asyncHandler(async (_req, res) => {
  ok(res, await testimonialModel.findAll())
})

export const createTestimonial = asyncHandler(async (req, res) => {
  requireFields(req.body, ['customer_name', 'review'])
  created(res, await testimonialModel.create(req.body))
})

export const updateTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await testimonialModel.update(req.params.id, req.body)
  if (!testimonial) throw notFoundError('Testimonial not found')
  ok(res, testimonial)
})

export const deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await testimonialModel.remove(req.params.id)
  if (!testimonial) throw notFoundError('Testimonial not found')
  noContent(res)
})
