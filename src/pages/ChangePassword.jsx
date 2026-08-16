import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { changePassword } from '../api/auth'
import logo from '../assets/logo.png'

const inputClass =
  'min-h-12 w-full rounded-xl border-0 bg-white px-4 text-sm text-moss-900 ring-1 ring-sand-200 placeholder:text-moss-800/40 focus:outline-none focus:ring-2 focus:ring-moss-500'

export default function ChangePassword() {
  const { admin, updateAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (!admin) return <Navigate to="/admin/login" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }
    if (newPassword !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    setSubmitting(true)
    try {
      const result = await changePassword(currentPassword, newPassword)
      updateAdmin(result.admin)
      toast.success('Password updated successfully')
      navigate('/admin', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Could not update password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest-950 px-5 py-10">
      <div className="relative w-full max-w-md">
        <div className="rounded-3xl bg-sand-50 p-8 shadow-2xl sm:p-10">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-brass-500/50">
              <img src={logo} alt="Orenda logo" className="h-10 w-10 rounded-full object-contain" />
            </span>
            <h1 className="mt-5 font-display text-2xl font-bold text-moss-900">
              Set a new password
            </h1>
            <p className="mt-2 flex items-start gap-1.5 text-center text-sm text-moss-800/60">
              <ShieldCheck size={15} className="mt-0.5 shrink-0 text-brass-600" />
              For security, you must choose a personal password before continuing.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60">
                Current password
              </span>
              <input
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className={inputClass}
                required
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60">
                New password
              </span>
              <div className="relative">
                <Lock
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-moss-800/40"
                />
                <input
                  type={show ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className={`${inputClass} px-11`}
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60">
                Confirm new password
              </span>
              <div className="relative">
                <Lock
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-moss-800/40"
                />
                <input
                  type={show ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat new password"
                  className={`${inputClass} px-11`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? 'Hide passwords' : 'Show passwords'}
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
              {submitting ? 'Saving…' : 'Update password'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => logout().finally(() => navigate('/admin/login'))}
            className="mt-5 w-full text-center text-xs font-medium text-moss-800/50 transition-colors hover:text-red-600"
          >
            Sign out instead
          </button>
        </div>
      </div>
    </div>
  )
}
