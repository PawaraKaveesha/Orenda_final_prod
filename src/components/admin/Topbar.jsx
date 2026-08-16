import { useEffect, useRef, useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { Menu, ChevronDown, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import avatar from '../../assets/logo.png'

const titles = {
  '/admin': 'Dashboard',
  '/admin/inquiries': 'Customer Inquiries',
  '/admin/villas': 'Villas',
  '/admin/gallery': 'Gallery',
  '/admin/offers': 'Offers',
  '/admin/settings': 'Settings',
}

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation()
  const { admin, logout } = useAuth()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  const title = titles[pathname] || 'Dashboard'

  useEffect(() => {
    const onPointerDown = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const displayName = admin?.full_name || 'Administrator'
  const displayEmail = admin?.email || ''

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-sand-200 bg-sand-50/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-moss-800 ring-1 ring-sand-200 transition-colors hover:bg-moss-50 lg:hidden"
      >
        <Menu size={22} />
      </button>

      <h1 className="min-w-0 truncate font-display text-lg font-semibold text-moss-900 sm:text-xl">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            aria-expanded={profileOpen}
            className="flex min-h-11 items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-moss-50 sm:px-3"
          >
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-2 ring-moss-500">
              <img src={avatar} alt="Admin avatar" className="h-full w-full object-cover" />
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold text-moss-900">{displayName}</span>
              <span className="block text-xs text-moss-800/60 capitalize">{admin?.role || 'admin'}</span>
            </span>
            <ChevronDown size={16} className="hidden text-moss-800/60 sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-14 w-56 rounded-2xl bg-sand-50 p-2 shadow-xl ring-1 ring-sand-200">
              <div className="border-b border-sand-200 px-3 py-2.5">
                <p className="text-sm font-semibold text-moss-900">{displayName}</p>
                <p className="text-xs text-moss-800/60">{displayEmail}</p>
              </div>
              <Link
                to="/admin/settings"
                className="mt-1 block rounded-xl px-3 py-2.5 text-sm text-moss-800 transition-colors hover:bg-moss-50"
              >
                Account settings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-500/10"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
