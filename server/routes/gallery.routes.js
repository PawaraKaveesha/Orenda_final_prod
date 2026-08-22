import { Router } from 'express'
import {
  listGallery,
  addGalleryItem,
  uploadGalleryItems,
  replaceGalleryItem,
  deleteGalleryItem,
} from '../controllers/gallery.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { uploadImage } from '../middleware/upload.js'

const router = Router()

// Public
router.get('/', listGallery)

// Admin Protected
router.post('/', requireAuth, requireRole('admin', 'superadmin'), addGalleryItem)
router.post('/upload', requireAuth, requireRole('admin', 'superadmin'), uploadImage.array('images', 10), uploadGalleryItems)
router.put('/:id/replace', requireAuth, requireRole('admin', 'superadmin'), uploadImage.array('images', 1), replaceGalleryItem)
router.delete('/:id', requireAuth, requireRole('admin', 'superadmin'), deleteGalleryItem)

export default router
