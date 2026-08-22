import { Router } from 'express'
import { serveGridFSImage, getImageMetadata } from '../controllers/image.controller.js'

const router = Router()

// Public WebP image streaming from GridFS
router.get('/:id', serveGridFSImage)
router.get('/:id/meta', getImageMetadata)

export default router
