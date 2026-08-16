import * as villaModel from '../models/villa.model.js'
import { asyncHandler, notFoundError } from '../utils/asyncHandler.js'
import { requireFields, parsePositiveNumber } from '../utils/validate.js'
import { ok, created, noContent } from '../utils/response.js'

export const listVillas = asyncHandler(async (_req, res) => {
  ok(res, await villaModel.findAll())
})

export const listAllVillas = asyncHandler(async (_req, res) => {
  ok(res, await villaModel.findAll({ includeHidden: true }))
})

export const getVilla = asyncHandler(async (req, res) => {
  const villa = await villaModel.findById(req.params.id)
  if (!villa) throw notFoundError('Villa not found')
  ok(res, villa)
})

export const createVilla = asyncHandler(async (req, res) => {
  requireFields(req.body, ['villa_name', 'description', 'price_per_night', 'image_url'])
  const price = parsePositiveNumber(req.body.price_per_night, 'price_per_night')
  created(res, await villaModel.create({ ...req.body, price_per_night: price }))
})

export const updateVilla = asyncHandler(async (req, res) => {
  const body = { ...req.body }
  if (body.price_per_night !== undefined) {
    body.price_per_night = parsePositiveNumber(body.price_per_night, 'price_per_night')
  }
  const villa = await villaModel.update(req.params.id, body)
  if (!villa) throw notFoundError('Villa not found')
  ok(res, villa)
})

export const deleteVilla = asyncHandler(async (req, res) => {
  const villa = await villaModel.remove(req.params.id)
  if (!villa) throw notFoundError('Villa not found')
  noContent(res)
})

export const listVillaImages = asyncHandler(async (req, res) => {
  const villa = await villaModel.findById(req.params.id)
  if (!villa) throw notFoundError('Villa not found')
  ok(res, await villaModel.findImages(req.params.id))
})

export const addVillaImage = asyncHandler(async (req, res) => {
  const villa = await villaModel.findById(req.params.id)
  if (!villa) throw notFoundError('Villa not found')
  created(res, await villaModel.addImage(req.params.id, req.body))
})
