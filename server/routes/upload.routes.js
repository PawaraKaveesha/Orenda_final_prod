import { Router } from 'express'
import { handleSingleUpload, handleBatchUpload } from '../controllers/upload.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { uploadImage } from '../middleware/upload.js'

const router = Router()

router.post('/', requireAuth, requireRole('admin', 'superadmin'), uploadImage.single('image'), handleSingleUpload)
router.post('/batch', requireAuth, requireRole('admin', 'superadmin'), uploadImage.array('images', 10), handleBatchUpload)

export default router
