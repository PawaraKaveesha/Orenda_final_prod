import { v2 as cloudinary } from 'cloudinary'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadDir = path.resolve(__dirname, '../public/images/uploads')

// Ensure local upload folder exists for local fallback
try {
  fs.mkdirSync(uploadDir, { recursive: true })
} catch (_e) {
  // directory already exists
}

export function isCloudinaryEnabled() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  )
}

if (isCloudinaryEnabled()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

/**
 * Uploads a file buffer to Cloudinary (or local fallback storage if credentials not set).
 * @param {Buffer} buffer - Raw file buffer
 * @param {string} originalName - Original filename
 * @param {string} mimeType - File MIME type
 * @returns {Promise<{ url: string, public_id: string }>}
 */
export async function uploadImageBuffer(buffer, originalName = 'image.jpg', mimeType = 'image/jpeg') {
  if (isCloudinaryEnabled()) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'orenda_galle',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error)
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          })
        }
      )
      stream.end(buffer)
    })
  }

  // Fallback to local storage when Cloudinary env vars are missing
  const ext = path.extname(originalName).toLowerCase() || '.jpg'
  const filename = `${Date.now()}-${randomUUID()}${ext}`
  const filePath = path.join(uploadDir, filename)
  await fs.promises.writeFile(filePath, buffer)
  return {
    url: `/images/uploads/${filename}`,
    public_id: filename,
  }
}

/**
 * Deletes an image from storage (Cloudinary or local storage).
 * @param {string} imageUrl
 */
export async function deleteImageFromStorage(imageUrl) {
  if (!imageUrl) return
  if (isCloudinaryEnabled() && imageUrl.includes('cloudinary.com')) {
    try {
      const parts = imageUrl.split('/')
      const filenameWithExt = parts.pop()
      const folder = parts.pop()
      const publicId = `${folder}/${filenameWithExt.split('.')[0]}`
      await cloudinary.uploader.destroy(publicId)
    } catch (err) {
      console.warn('Cloudinary image deletion error:', err.message)
    }
  } else if (imageUrl.startsWith('/images/uploads/')) {
    const filename = path.basename(imageUrl)
    const filePath = path.join(uploadDir, filename)
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath).catch(() => {})
    }
  }
}
