import { Router } from 'express'
import {
  listVillas,
  listAllVillas,
  getVilla,
  createVilla,
  updateVilla,
  deleteVilla,
  listVillaImages,
  addVillaImage,
} from '../controllers/villa.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// Public
router.get('/', listVillas)

// Admin
router.get('/all', requireAuth, requireRole('admin', 'superadmin'), listAllVillas)

// Public (id-specific)
router.get('/:id', getVilla)
router.get('/:id/images', listVillaImages)

// Admin (id-specific)
router.post('/', requireAuth, requireRole('admin', 'superadmin'), createVilla)
router.put('/:id', requireAuth, requireRole('admin', 'superadmin'), updateVilla)
router.delete('/:id', requireAuth, requireRole('admin', 'superadmin'), deleteVilla)
router.post('/:id/images', requireAuth, requireRole('admin', 'superadmin'), addVillaImage)

export default router
