import * as roomPhotoModel from '../models/room_photo.model.js'
import { asyncHandler, notFoundError } from '../utils/asyncHandler.js'
import { ok, created, noContent } from '../utils/response.js'
import { optimizeAndStoreInGridFS, deleteFromGridFS } from '../utils/gridfs.js'

export const listRoomPhotos = asyncHandler(async (_req, res) => {
  ok(res, await roomPhotoModel.findAll())
})

export const uploadRoomPhotos = asyncHandler(async (req, res) => {
  const files = req.files || (req.file ? [req.file] : [])
  if (files.length === 0) {
    const err = new Error('No image files provided for upload')
    err.status = 400
    throw err
  }

  const caption = req.body.caption || ''
  const createdItems = []

  for (const file of files) {
    const optimized = await optimizeAndStoreInGridFS(file.buffer, file.originalname, file.mimetype)
    const item = await roomPhotoModel.create({
      image_url: optimized.url,
      caption,
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

export const deleteRoomPhoto = asyncHandler(async (req, res) => {
  const existing = await roomPhotoModel.findById(req.params.id)
  if (!existing) throw notFoundError('Room photo not found')
  if (existing.image_url) {
    await deleteFromGridFS(existing.image_url)
  }
  const deleted = await roomPhotoModel.remove(req.params.id)
  if (!deleted) throw notFoundError('Room photo not found')
  noContent(res)
})
