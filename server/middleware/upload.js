import multer from 'multer'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadDir = path.resolve(__dirname, '../', process.env.UPLOAD_DIR || 'public/images/uploads')

mkdirSync(uploadDir, { recursive: true })

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const maxBytes = Number(process.env.MAX_UPLOAD_MB || 5) * 1024 * 1024

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${Date.now()}-${randomUUID()}${ext}`)
  },
})

const fileFilter = (_req, file, cb) => {
  if (!ALLOWED.has(file.mimetype)) {
    const err = new Error('Only JPEG, PNG, WEBP and GIF images are allowed')
    err.status = 400
    return cb(err)
  }
  return cb(null, true)
}

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxBytes },
})

// Public URL prefix for uploaded files, e.g. /images/uploads/....
export function publicUrl(req, filename) {
  const base = req.protocol + '://' + req.get('host')
  return `${base}/images/uploads/${filename}`
}
