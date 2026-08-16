import { useEffect, useState } from 'react'
import {
  X,
  Mail,
  Phone,
  CalendarDays,
  Users,
  Home,
  Clock,
  Check,
  Reply,
  Trash2,
  StickyNote,
  Plus,
} from 'lucide-react'
import StatusBadge from './StatusBadge'

const field =
  'flex items-start gap-3 rounded-xl bg-sand-100 px-4 py-3'
const label =
  'flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-moss-800/60'
const value = 'mt-1 break-words text-sm font-medium text-moss-900'

export default function InquiryDrawer({
  inquiry,
  open,
  onClose,
  onStatusChange,
  onDelete,
  onAddNote,
}) {
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) setNote('')
  }, [open])

  if (!open || !inquiry) return null

  const addNote = () => {
    if (!note.trim()) return
    onAddNote(note.trim())
    setNote('')
  }

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={`Inquiry ${inquiry.id}`}>
      <div
        className="absolute inset-0 bg-forest-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-sand-50 shadow-2xl">
        <header className="flex items-center justify-between gap-3 border-b border-sand-200 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-moss-800/60">
              Inquiry
            </p>
            <h2 className="mt-0.5 font-display text-lg font-semibold text-moss-900">
              {inquiry.id}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={inquiry.status} />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="flex h-10 w-10 items-center justify-center rounded-full text-moss-700 ring-1 ring-sand-200 transition-colors hover:bg-moss-50"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-moss-800/60">
              Customer
            </h3>
            <div className="space-y-2">
              <div className={field}>
                <Mail size={16} className="mt-0.5 shrink-0 text-moss-600" />
                <div className="min-w-0">
                  <span className={label}>Email</span>
                  <p className={value}>{inquiry.email}</p>
                </div>
              </div>
              <div className={field}>
                <Phone size={16} className="mt-0.5 shrink-0 text-moss-600" />
                <div className="min-w-0">
                  <span className={label}>Phone</span>
                  <p className={value}>{inquiry.phone}</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-moss-800/60">
              Stay Details
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className={field}>
                <Home size={16} className="mt-0.5 shrink-0 text-moss-600" />
                <div className="min-w-0">
                  <span className={label}>Villa</span>
                  <p className={value}>{inquiry.villa}</p>
                </div>
              </div>
              <div className={field}>
                <CalendarDays size={16} className="mt-0.5 shrink-0 text-moss-600" />
                <div className="min-w-0">
                  <span className={label}>Check-in</span>
                  <p className={value}>{inquiry.checkIn}</p>
                </div>
              </div>
              <div className={field}>
                <CalendarDays size={16} className="mt-0.5 shrink-0 text-moss-600" />
                <div className="min-w-0">
                  <span className={label}>Check-out</span>
                  <p className={value}>{inquiry.checkOut}</p>
                </div>
              </div>
              <div className={field}>
                <Users size={16} className="mt-0.5 shrink-0 text-moss-600" />
                <div className="min-w-0">
                  <span className={label}>Guests</span>
                  <p className={value}>{inquiry.guests}</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-moss-800/60">
              Message
            </h3>
            <div className="rounded-xl bg-sand-100 px-4 py-3">
              <p className="text-sm leading-relaxed text-moss-800">{inquiry.message}</p>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-moss-800/60">
                <Clock size={14} />
                Submitted {new Date(inquiry.submittedAt).toLocaleString()}
              </p>
            </div>
          </section>

          <section>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-moss-800/60">
              <StickyNote size={14} /> Internal Notes
            </h3>
            {inquiry.notes.length > 0 ? (
              <ul className="space-y-2">
                {inquiry.notes.map((n, i) => (
                  <li
                    key={`${n}-${i}`}
                    className="rounded-xl bg-brass-500/10 px-4 py-2.5 text-sm text-brass-600 ring-1 ring-brass-500/20"
                  >
                    {n}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-moss-800/50">No internal notes yet.</p>
            )}
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addNote()
                }}
                placeholder="Add a note…"
                aria-label="Add internal note"
                className="min-h-11 w-full flex-1 rounded-xl border-0 bg-sand-100 px-4 text-sm text-moss-900 ring-1 ring-sand-200 placeholder:text-moss-800/40 focus:outline-none focus:ring-2 focus:ring-moss-500"
              />
              <button
                type="button"
                onClick={addNote}
                aria-label="Add note"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-moss-600 text-white transition-colors hover:bg-moss-700"
              >
                <Plus size={18} />
              </button>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-moss-800/60">
              Status
            </h3>
            <div className="relative">
              <select
                value={inquiry.status}
                onChange={(e) => onStatusChange(inquiry.id, e.target.value)}
                aria-label="Change status"
                className="min-h-11 w-full appearance-none rounded-xl bg-sand-100 px-4 text-sm font-medium text-moss-900 ring-1 ring-sand-200 focus:outline-none focus:ring-2 focus:ring-moss-500"
              >
                <option value="New">New</option>
                <option value="Read">Read</option>
                <option value="Replied">Replied</option>
              </select>
              <ChevronArrow />
            </div>
          </section>
        </div>

        <footer className="flex flex-wrap gap-2 border-t border-sand-200 px-5 py-4">
          <button
            type="button"
            onClick={() => onStatusChange(inquiry.id, 'Read')}
            disabled={inquiry.status === 'Read'}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-moss-50 px-4 text-sm font-semibold text-moss-700 ring-1 ring-moss-500/40 transition-colors hover:bg-moss-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check size={16} /> Mark as Read
          </button>
          <button
            type="button"
            onClick={() => onStatusChange(inquiry.id, 'Replied')}
            disabled={inquiry.status === 'Replied'}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-moss-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-moss-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Reply size={16} /> Mark as Replied
          </button>
          <button
            type="button"
            onClick={() => onDelete(inquiry.id)}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-red-600 ring-1 ring-red-500/40 transition-colors hover:bg-red-500/10"
          >
            <Trash2 size={16} /> Delete
          </button>
        </footer>
      </aside>
    </div>
  )
}

function ChevronArrow() {
  return (
    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-moss-700">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  )
}
