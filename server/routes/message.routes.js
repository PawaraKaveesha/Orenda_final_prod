import { Router } from 'express'
import { listMessages, createMessage, markMessageRead } from '../controllers/message.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, requireRole('admin', 'superadmin'), listMessages)
router.post('/', requireAuth, requireRole('admin', 'superadmin'), createMessage)
router.patch('/:id/read', requireAuth, requireRole('admin', 'superadmin'), markMessageRead)

export default router
