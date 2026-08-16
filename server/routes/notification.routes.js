import { Router } from 'express'
import { listNotifications } from '../controllers/notification.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, requireRole('admin', 'superadmin'), listNotifications)

export default router
