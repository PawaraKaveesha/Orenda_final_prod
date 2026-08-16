import { Router } from 'express'
import { login, logout, me, changePassword } from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { loginLimiter } from '../middleware/loginLimiter.js'

const router = Router()

router.post('/login', loginLimiter, login)
router.post('/logout', logout)
router.get('/me', requireAuth, me)
router.post('/change-password', requireAuth, changePassword)

export default router
