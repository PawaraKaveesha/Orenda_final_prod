import { useState } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'
import { images } from '../data/images'

const inputClass =
  'min-h-12 w-full rounded-xl border-0 bg-white px-4 text-sm text-moss-900 ring-1 ring-sand-200 placeholder:text-moss-800/40 focus:outline-none focus:ring-2 focus:ring-moss-500'

export default function Login() {
  const { admin, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (admin && !admin.must_change_password) return <Navigate to={from} replace />
  if (admin && admin.must_change_password) return <Navigate to="/admin/change-password" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Enter your email and password')
      return
    }
    setSubmitting(true)
    try {
      const session = await login(email, password)
      toast.success(`Welcome back, ${session.full_name.split(' ')[0]}`)
      if (session.must_change_password) {
        navigate('/admin/change-password', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (err) {
      toast.error(err.message || 'Sign in failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest-950 px-5 py-10">
      <div className="absolute inset-0 opacity-20">
        <img
          src={images.welcome}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-forest-950/70 via-forest-950/85 to-forest-950" />

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl bg-sand-50 p-8 shadow-2xl sm:p-10">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-brass-500/50">
              <img src={logo} alt="Orenda logo" className="h-10 w-10 rounded-full object-contain" />
            </span>
            <h1 className="mt-5 font-display text-2xl font-bold text-moss-900">Admin Sign In</h1>
            <p className="mt-1 text-sm text-moss-800/60">Orenda Eco lodge and Spa — Resort Management</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60">
                Email
              </span>
              <div className="relative">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-moss-800/40"
                />
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@orendaresort.com"
                  className={`${inputClass} pl-11`}
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60">
                Password
              </span>
              <div className="relative">
                <Lock
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-moss-800/40"
                />
                <input
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} px-11`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-moss-800/50 transition-colors hover:text-moss-700"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brass-500 px-6 text-sm font-medium uppercase tracking-wide text-white transition-all duration-300 hover:bg-brass-600 hover:shadow-lg hover:shadow-brass-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign In'}
              {!submitting && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-moss-800/50">
            Protected area — authorised staff only.
          </p>
        </div>
      </div>
    </div>
  )
}
