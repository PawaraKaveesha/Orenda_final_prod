import { Router } from 'express'
import { listBookings, createBooking, updateBookingStatus } from '../controllers/booking.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, requireRole('admin', 'superadmin'), listBookings)
router.post('/', requireAuth, requireRole('admin', 'superadmin'), createBooking)
router.patch('/:id/status', requireAuth, requireRole('admin', 'superadmin'), updateBookingStatus)

export default router
