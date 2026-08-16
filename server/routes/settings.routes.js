import { Router } from 'express'
import {
  getPublicSettings,
  getSettings,
  updateSettings,
} from '../controllers/settings.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/public', getPublicSettings)
router.get('/', requireAuth, requireRole('admin', 'superadmin'), getSettings)
router.put('/', requireAuth, requireRole('admin', 'superadmin'), updateSettings)

export default router
