import { Router } from 'express'
import {
  listRoomPhotos,
  uploadRoomPhotos,
  deleteRoomPhoto,
} from '../controllers/room_photo.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { uploadImage } from '../middleware/upload.js'

const router = Router()

// Public — fetched by the About Us Rooms section
router.get('/', listRoomPhotos)

// Admin protected
router.post(
  '/upload',
  requireAuth,
  requireRole('admin', 'superadmin'),
  uploadImage.array('images', 20),
  uploadRoomPhotos,
)
router.delete('/:id', requireAuth, requireRole('admin', 'superadmin'), deleteRoomPhoto)

export default router
