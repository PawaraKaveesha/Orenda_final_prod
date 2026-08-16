import * as galleryModel from '../models/gallery.model.js'
import { asyncHandler, notFoundError } from '../utils/asyncHandler.js'
import { requireFields } from '../utils/validate.js'
import { ok, created, noContent } from '../utils/response.js'

export const listGallery = asyncHandler(async (_req, res) => {
  ok(res, await galleryModel.findAll())
})

export const addGalleryItem = asyncHandler(async (req, res) => {
  requireFields(req.body, ['image_url'])
  created(res, await galleryModel.create(req.body))
})

export const deleteGalleryItem = asyncHandler(async (req, res) => {
  const item = await galleryModel.remove(req.params.id)
  if (!item) throw notFoundError('Gallery item not found')
  noContent(res)
})
