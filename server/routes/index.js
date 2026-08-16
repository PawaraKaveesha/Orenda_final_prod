import { Router } from 'express'
import authRoutes from './auth.routes.js'
import dashboardRoutes from './dashboard.routes.js'
import villaRoutes from './villa.routes.js'
import offerRoutes from './offer.routes.js'
import inquiryRoutes from './inquiry.routes.js'
import galleryRoutes from './gallery.routes.js'
import adminRoutes from './admin.routes.js'
import testimonialRoutes from './testimonial.routes.js'
import settingsRoutes from './settings.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/villas', villaRoutes)
router.use('/offers', offerRoutes)
router.use('/inquiries', inquiryRoutes)
router.use('/gallery', galleryRoutes)
router.use('/admins', adminRoutes)
router.use('/testimonials', testimonialRoutes)
router.use('/settings', settingsRoutes)

export default router
