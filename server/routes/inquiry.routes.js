import { Router } from 'express'
import {
  listInquiries,
  getInquiry,
  createInquiry,
  updateInquiry,
  addInquiryNote,
  deleteInquiry,
} from '../controllers/inquiry.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// Public — contact form submission
router.post('/', createInquiry)

// Admin
router.get('/', requireAuth, requireRole('admin', 'superadmin'), listInquiries)
router.get('/:id', requireAuth, requireRole('admin', 'superadmin'), getInquiry)
router.patch('/:id', requireAuth, requireRole('admin', 'superadmin'), updateInquiry)
router.post('/:id/notes', requireAuth, requireRole('admin', 'superadmin'), addInquiryNote)
router.delete('/:id', requireAuth, requireRole('admin', 'superadmin'), deleteInquiry)

export default router
