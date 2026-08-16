import * as offerModel from '../models/offer.model.js'
import { asyncHandler, notFoundError } from '../utils/asyncHandler.js'
import { requireFields, parsePositiveNumber } from '../utils/validate.js'
import { ok, created, noContent } from '../utils/response.js'

export const listOffers = asyncHandler(async (req, res) => {
  const activeOnly = req.query.active === 'true'
  ok(res, await offerModel.findAll({ activeOnly }))
})

export const getOffer = asyncHandler(async (req, res) => {
  const offer = await offerModel.findById(req.params.id)
  if (!offer) throw notFoundError('Offer not found')
  ok(res, offer)
})

export const createOffer = asyncHandler(async (req, res) => {
  requireFields(req.body, ['title', 'description', 'start_date', 'end_date', 'banner_image', 'base_price'])
  const body = { ...req.body, base_price: parsePositiveNumber(req.body.base_price, 'base_price') }
  created(res, await offerModel.create(body))
})

export const updateOffer = asyncHandler(async (req, res) => {
  const body = { ...req.body }
  if (body.base_price !== undefined) {
    body.base_price = parsePositiveNumber(body.base_price, 'base_price')
  }
  const offer = await offerModel.update(req.params.id, body)
  if (!offer) throw notFoundError('Offer not found')
  ok(res, offer)
})

export const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await offerModel.remove(req.params.id)
  if (!offer) throw notFoundError('Offer not found')
  noContent(res)
})
