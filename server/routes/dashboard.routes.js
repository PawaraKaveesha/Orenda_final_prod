import { Router } from 'express'
import { getDashboardStats } from '../controllers/dashboard.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, requireRole('admin', 'superadmin'), getDashboardStats)

export default router
