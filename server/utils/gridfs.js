import mongoose from 'mongoose'
import sharp from 'sharp'
import crypto from 'node:crypto'
import ImageMeta from '../models/image.model.js'

let gridFsBucket = null

/**
 * Gets or initializes the MongoDB GridFSBucket.
 */
export function getGridFsBucket() {
  if (!gridFsBucket) {
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database not connected. Cannot initialize GridFSBucket.')
    }
    gridFsBucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'images',
    })
  }
  return gridFsBucket
}

/**
 * Optimizes an uploaded image buffer (resizes up to 1920x1920, converts to WebP @ 82% quality, strips EXIF),
 * checks for duplicates via SHA-256 hash, and stores the binary data in MongoDB GridFS.
 *
 * @param {Buffer} buffer - Original image buffer
 * @param {string} originalName - Original filename
 * @param {string} mimeType - Original MIME type
 * @returns {Promise<Object>} Metadata object including /api/images/:id URL, originalSize, optimizedSize, savedPercent
 */
export async function optimizeAndStoreInGridFS(buffer, originalName = 'image.jpg', mimeType = 'image/jpeg') {
  const bucket = getGridFsBucket()
  const originalSize = buffer.length

  // 1. Process image with sharp: auto-orient, resize (max 1920x1920), convert to WebP, strip EXIF metadata
  const sharpInstance = sharp(buffer).rotate().resize({
    width: 1920,
    height: 1920,
    fit: 'inside',
    withoutEnlargement: true,
  })

  const { data: optimizedBuffer, info } = await sharpInstance
    .webp({ quality: 82, effort: 4 })
    .toBuffer({ resolveWithObject: true })

  const optimizedSize = optimizedBuffer.length
  const savedBytes = Math.max(0, originalSize - optimizedSize)
  const savedPercent = Math.round((savedBytes / originalSize) * 100)

  // 2. Compute SHA-256 hash for deduplication
  const hash = crypto.createHash('sha256').update(optimizedBuffer).digest('hex')

  // 3. Deduplication check: look for an existing image with identical hash
  const existingMeta = await ImageMeta.findOne({ hash })
  if (existingMeta) {
    // Verify file still exists in GridFS bucket
    const files = await bucket.find({ _id: existingMeta.gridFsFileId }).toArray()
    if (files && files.length > 0) {
      return {
        url: `/api/images/${existingMeta.gridFsFileId}`,
        gridFsFileId: existingMeta.gridFsFileId.toString(),
        filename: existingMeta.filename,
        originalName,
        originalSize,
        optimizedSize,
        savedPercent,
        width: existingMeta.width || info.width,
        height: existingMeta.height || info.height,
        contentType: 'image/webp',
        isDuplicate: true,
      }
    }
  }

  // 4. Store optimized binary buffer in MongoDB GridFS
  const baseName = originalName.replace(/\.[^/.]+$/, '')
  const safeFilename = `${Date.now()}-${baseName.replace(/[^a-zA-Z0-9_-]/g, '_')}.webp`

  const uploadStream = bucket.openUploadStream(safeFilename, {
    contentType: 'image/webp',
    metadata: {
      originalName,
      originalSize,
      optimizedSize,
      width: info.width,
      height: info.height,
      hash,
    },
  })

  await new Promise((resolve, reject) => {
    uploadStream.on('finish', resolve)
    uploadStream.on('error', reject)
    uploadStream.end(optimizedBuffer)
  })

  const gridFsFileId = uploadStream.id

  // 5. Save metadata record in MongoDB
  const metaDoc = await ImageMeta.create({
    filename: safeFilename,
    originalName,
    contentType: 'image/webp',
    width: info.width,
    height: info.height,
    originalSize,
    size: optimizedSize,
    savedPercent,
    gridFsFileId,
    hash,
  })

  return {
    url: `/api/images/${gridFsFileId}`,
    gridFsFileId: gridFsFileId.toString(),
    filename: safeFilename,
    originalName,
    originalSize,
    optimizedSize,
    savedPercent,
    width: info.width,
    height: info.height,
    contentType: 'image/webp',
    isDuplicate: false,
    metaId: metaDoc._id,
  }
}

/**
 * Deletes an image binary from GridFS and cleans up its metadata record.
 * @param {string} idOrUrl - GridFS ObjectId or /api/images/:id URL string
 */
export async function deleteFromGridFS(idOrUrl) {
  if (!idOrUrl) return false
  let idString = idOrUrl
  if (idOrUrl.includes('/api/images/')) {
    idString = idOrUrl.split('/api/images/').pop()
  }

  if (!mongoose.Types.ObjectId.isValid(idString)) {
    return false
  }

  const objectId = new mongoose.Types.ObjectId(idString)
  const bucket = getGridFsBucket()

  // Find metadata
  const meta = await ImageMeta.findOne({ gridFsFileId: objectId })

  // Delete binary chunks from GridFS bucket
  try {
    await bucket.delete(objectId)
  } catch (err) {
    console.warn(`GridFS delete error for ${idString}:`, err.message)
  }

  // Delete metadata record
  if (meta) {
    await ImageMeta.deleteOne({ _id: meta._id })
  }

  return true
}
