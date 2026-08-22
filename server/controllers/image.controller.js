import mongoose from 'mongoose'
import { getGridFsBucket } from '../utils/gridfs.js'
import ImageMeta from '../models/image.model.js'

export async function serveGridFSImage(req, res, next) {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Invalid image ID format' })
    }

    const objectId = new mongoose.Types.ObjectId(id)
    const bucket = getGridFsBucket()

    // Find the GridFS file descriptor
    const files = await bucket.find({ _id: objectId }).toArray()
    if (!files || files.length === 0) {
      return res.status(404).json({ success: false, message: 'Image not found in storage' })
    }

    const file = files[0]

    // Set ETag & HTTP Browser Caching headers
    const etag = `"${file._id.toString()}"`
    res.setHeader('Content-Type', file.contentType || 'image/webp')
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.setHeader('ETag', etag)

    // Support HTTP 304 Not Modified browser caching
    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end()
    }

    if (file.length) {
      res.setHeader('Content-Length', file.length)
    }

    // Stream image binary directly from GridFS bucket to response
    const downloadStream = bucket.openDownloadStream(objectId)
    downloadStream.on('error', (err) => {
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Error streaming image' })
      }
    })

    downloadStream.pipe(res)
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
