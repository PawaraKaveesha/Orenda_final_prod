import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Inbox,
  Home,
  ImageIcon,
  BadgePercent,
  Settings,
  LogOut,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.png'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/inquiries', label: 'Customer Inquiries', icon: Inbox },
  { to: '/admin/villas', label: 'Villas', icon: Home },
  { to: '/admin/gallery', label: 'Gallery', icon: ImageIcon },
  { to: '/admin/offers', label: 'Offers', icon: BadgePercent },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const linkClass = ({ isActive }) =>
    `flex min-h-11 items-center gap-3 rounded-xl px-4 text-sm transition-all duration-300 ${
      isActive
        ? 'bg-brass-500/15 font-semibold text-brass-400'
        : 'text-sand-200/80 hover:bg-sand-50/10 hover:text-sand-50'
    }`

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-forest-950/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-forest-950 transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Admin navigation"
      >
        <div className="flex items-center justify-between gap-3 px-5 py-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brass-500/50">
              <img src={logo} alt="Orenda logo" className="h-6 w-6 rounded-full object-contain" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-base font-semibold text-sand-50">
                Orenda Eco lodge and Spa
              </p>
              <p className="text-[11px] uppercase tracking-widest text-brass-400">
                Resort Admin
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sand-200 transition-colors hover:bg-sand-50/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={linkClass}
            >
              <item.icon size={19} strokeWidth={2} className="shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-sand-50/10 px-3 py-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 text-sm text-sand-200/80 transition-all duration-300 hover:bg-sand-50/10 hover:text-sand-50"
          >
            <LogOut size={19} className="shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
