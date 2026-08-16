import { Router } from 'express'
import {
  listOffers,
  getOffer,
  createOffer,
  updateOffer,
  deleteOffer,
} from '../controllers/offer.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// Public
router.get('/', listOffers)
router.get('/:id', getOffer)

// Admin
router.post('/', requireAuth, requireRole('admin', 'superadmin'), createOffer)
router.put('/:id', requireAuth, requireRole('admin', 'superadmin'), updateOffer)
router.delete('/:id', requireAuth, requireRole('admin', 'superadmin'), deleteOffer)

export default router
