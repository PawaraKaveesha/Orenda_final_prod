import { Router } from 'express'
import { listGallery, addGalleryItem, deleteGalleryItem } from '../controllers/gallery.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// Public
router.get('/', listGallery)

// Admin
router.post('/', requireAuth, requireRole('admin', 'superadmin'), addGalleryItem)
router.delete('/:id', requireAuth, requireRole('admin', 'superadmin'), deleteGalleryItem)

export default router
