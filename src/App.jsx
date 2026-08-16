import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import About from './pages/About'
import Mission from './pages/Mission'
import Vision from './pages/Vision'
import Login from './pages/Login'
import ChangePassword from './pages/ChangePassword'
import AdminLayout from './layouts/admin/AdminLayout'
import ProtectedRoute from './components/routing/ProtectedRoute'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminInquiries from './pages/admin/AdminInquiries'
import AdminVillas from './pages/admin/AdminVillas'
import AdminGallery from './pages/admin/AdminGallery'
import AdminOffers from './pages/admin/AdminOffers'
import AdminSettings from './pages/admin/AdminSettings'

function ScrollManager() {
  const location = useLocation()
  useEffect(() => {
    const target = location.state?.scrollTo
    if (target) {
      const t = setTimeout(() => {
        document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' })
      }, 80)
      return () => clearTimeout(t)
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname, location.state])
  return null
}

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <a
        href="#main-content"
        className="sr-only z-[70] rounded-full bg-moss-700 px-5 py-3 text-sm font-medium text-sand-50 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<About />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/vision" element={<Vision />} />
        </Route>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/change-password" element={<ChangePassword />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="villas" element={<AdminVillas />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="offers" element={<AdminOffers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
