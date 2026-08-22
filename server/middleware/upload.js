import multer from 'multer'

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const maxBytes = Number(process.env.MAX_UPLOAD_MB || 5) * 1024 * 1024

const storage = multer.memoryStorage()

const fileFilter = (_req, file, cb) => {
  if (!ALLOWED.has(file.mimetype)) {
    const err = new Error('Only JPEG, PNG, WEBP and GIF image formats are allowed')
    err.status = 400
    return cb(err, false)
  }
  return cb(null, true)
}

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxBytes },
})

