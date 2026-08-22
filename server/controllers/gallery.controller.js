import * as galleryModel from '../models/gallery.model.js'
import { asyncHandler, notFoundError } from '../utils/asyncHandler.js'
import { requireFields } from '../utils/validate.js'
import { ok, created, noContent } from '../utils/response.js'
import { optimizeAndStoreInGridFS, deleteFromGridFS } from '../utils/gridfs.js'

export const listGallery = asyncHandler(async (_req, res) => {
  ok(res, await galleryModel.findAll())
})

export const addGalleryItem = asyncHandler(async (req, res) => {
  requireFields(req.body, ['image_url'])
  created(res, await galleryModel.create(req.body))
})

export const uploadGalleryItems = asyncHandler(async (req, res) => {
  const files = req.files || (req.file ? [req.file] : [])
  if (files.length === 0) {
    const err = new Error('No image files provided for upload')
    err.status = 400
    throw err
  }

  const category = req.body.category || 'Resort'
  const createdItems = []

  for (const file of files) {
    const optimized = await optimizeAndStoreInGridFS(file.buffer, file.originalname, file.mimetype)
    const item = await galleryModel.create({
      image_url: optimized.url,
      category,
    })

    const itemObj = item.toObject ? item.toObject() : item
    createdItems.push({
      ...itemObj,
      optimization: {
        originalName: optimized.originalName,
        originalSize: optimized.originalSize,
        optimizedSize: optimized.optimizedSize,
        savedPercent: optimized.savedPercent,
        width: optimized.width,
        height: optimized.height,
        isDuplicate: optimized.isDuplicate,
      },
    })
  }

  created(res, createdItems.length === 1 ? createdItems[0] : createdItems)
})

export const replaceGalleryItem = asyncHandler(async (req, res) => {
  const { id } = req.params
  const existing = await galleryModel.findById(id)
  if (!existing) throw notFoundError('Gallery item not found')

  const files = req.files || (req.file ? [req.file] : [])
  if (files.length === 0) {
    const err = new Error('No replacement image file provided')
    err.status = 400
    throw err
  }

  const file = files[0]
  const category = req.body.category || existing.category || 'Resort'

  // Optimize & store replacement image in GridFS
  const optimized = await optimizeAndStoreInGridFS(file.buffer, file.originalname, file.mimetype)

  // Remove old binary from GridFS
  if (existing.image_url) {
    await deleteFromGridFS(existing.image_url)
  }

  const updated = await galleryModel.update(id, {
    image_url: optimized.url,
    category,
  })

  const updatedObj = updated.toObject ? updated.toObject() : updated
  ok(res, {
    ...updatedObj,
    optimization: {
      originalName: optimized.originalName,
      originalSize: optimized.originalSize,
      optimizedSize: optimized.optimizedSize,
      savedPercent: optimized.savedPercent,
      width: optimized.width,
      height: optimized.height,
      isDuplicate: optimized.isDuplicate,
    },
  })
})

export const deleteGalleryItem = asyncHandler(async (req, res) => {
  const existing = await galleryModel.findById(req.params.id)
  if (existing && existing.image_url) {
    await deleteFromGridFS(existing.image_url)
  }
  const deleted = await galleryModel.remove(req.params.id)
  if (!deleted) throw notFoundError('Gallery item not found')
  noContent(res)
})
