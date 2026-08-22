import { asyncHandler } from '../utils/asyncHandler.js'
import { created } from '../utils/response.js'
import { uploadImageBuffer } from '../utils/storage.js'

export const handleSingleUpload = asyncHandler(async (req, res) => {
  const file = req.file || (req.files && req.files[0])
  if (!file) {
    const err = new Error('No image file provided for upload')
    err.status = 400
    throw err
  }
  const result = await uploadImageBuffer(file.buffer, file.originalname, file.mimetype)
  created(res, { url: result.url, public_id: result.public_id })
})

export const handleBatchUpload = asyncHandler(async (req, res) => {
  const files = req.files || (req.file ? [req.file] : [])
  if (files.length === 0) {
    const err = new Error('No image files provided for upload')
    err.status = 400
    throw err
  }
  const results = []
  for (const file of files) {
    const uploaded = await uploadImageBuffer(file.buffer, file.originalname, file.mimetype)
    results.push(uploaded)
  }
  created(res, results)
})
