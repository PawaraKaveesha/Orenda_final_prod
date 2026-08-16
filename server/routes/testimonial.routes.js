import { Router } from 'express'
import {
  listTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../controllers/testimonial.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// Public — displayed on the home page
router.get('/', listTestimonials)

// Admin only — the public site never edits testimonials directly
router.post('/', requireAuth, requireRole('admin', 'superadmin'), createTestimonial)
router.put('/:id', requireAuth, requireRole('admin', 'superadmin'), updateTestimonial)
router.delete('/:id', requireAuth, requireRole('admin', 'superadmin'), deleteTestimonial)

export default router
