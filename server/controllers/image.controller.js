import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import sharp from 'sharp'
import { getGridFsBucket } from '../utils/gridfs.js'
import ImageMeta from '../models/image.model.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicImagesDir = path.join(__dirname, '../public/images')

const KNOWN_ROOM_PHOTOS = {
  '6abf934a8edb2582cb3cd473': 'img-13.jpeg',
  '6abf934a8edb2582cb3cd478': 'img-14.jpeg',
  '6abf934a8edb2582cb3cd47d': 'img-15.jpeg',
}

export async function serveGridFSImage(req, res, next) {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Invalid image ID format' })
    }

    const objectId = new mongoose.Types.ObjectId(id)

    // Try GridFS if database is connected
    if (mongoose.connection.readyState === 1) {
      try {
        const bucket = getGridFsBucket()
        const files = await bucket.find({ _id: objectId }).toArray()
        if (files && files.length > 0) {
          const file = files[0]
          const etag = `"${file._id.toString()}"`
          res.setHeader('Content-Type', file.contentType || 'image/webp')
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
          res.setHeader('ETag', etag)

          if (req.headers['if-none-match'] === etag) {
            return res.status(304).end()
          }

          if (file.length) {
            res.setHeader('Content-Length', file.length)
          }

          const downloadStream = bucket.openDownloadStream(objectId)
          downloadStream.on('error', (err) => {
            if (!res.headersSent) {
              res.status(500).json({ success: false, message: 'Error streaming image' })
            }
          })

          return downloadStream.pipe(res)
        }
      } catch (gridFsErr) {
        // Fall through to known static fallback if GridFS query fails
      }
    }

    // Fallback: serve known room photo file optimized as WebP if not found in GridFS
    if (KNOWN_ROOM_PHOTOS[id]) {
      const filePath = path.join(publicImagesDir, KNOWN_ROOM_PHOTOS[id])
      if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'image/webp')
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        return sharp(filePath).webp({ quality: 85 }).pipe(res)
      }
    }

    return res.status(404).json({ success: false, message: 'Image not found in storage' })
  } catch (err) {
    next(err)
  }
}

export async function getImageMetadata(req, res, next) {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Invalid image ID' })
    }
    const meta = await ImageMeta.findOne({ gridFsFileId: new mongoose.Types.ObjectId(id) })
    if (!meta) {
      return res.status(404).json({ success: false, message: 'Metadata not found' })
    }
    res.json({ success: true, data: meta })
  } catch (err) {
    next(err)
  }
}
