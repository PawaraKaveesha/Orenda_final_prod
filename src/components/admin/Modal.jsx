import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
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

  if (!open) return null

  const widths = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-forest-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-sand-50 shadow-2xl sm:rounded-2xl ${widths[size]}`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-sand-200 bg-sand-50/95 px-6 py-4 backdrop-blur">
          <h2 className="font-display text-lg font-semibold text-moss-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-moss-700 ring-1 ring-sand-200 transition-colors hover:bg-moss-50"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-3 border-t border-sand-200 bg-sand-50/95 px-6 py-4 backdrop-blur">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
