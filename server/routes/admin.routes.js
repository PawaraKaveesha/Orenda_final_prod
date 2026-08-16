import { Router } from 'express'
import {
  listAdmins,
  getAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from '../controllers/admin.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', requireRole('superadmin'), listAdmins)
router.post('/', requireRole('superadmin'), createAdmin)
router.get('/:id', requireRole('admin', 'superadmin'), getAdmin)
router.put('/:id', requireRole('superadmin'), updateAdmin)
router.delete('/:id', requireRole('superadmin'), deleteAdmin)

export default router
