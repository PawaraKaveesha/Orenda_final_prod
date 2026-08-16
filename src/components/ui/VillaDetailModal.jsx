import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, BedDouble, Users, Ruler, Check } from 'lucide-react'
import Button from './Button'

export default function VillaDetailModal({ villa, open, onClose }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open || !villa) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[60] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`${villa.name} details`}
    >
      <div
        className="fixed inset-0 bg-forest-950/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex min-h-full items-center justify-center p-3 sm:p-6">
        <div className="relative my-4 w-full max-w-3xl overflow-hidden rounded-3xl bg-sand-50 shadow-2xl">
          <div className="relative aspect-[16/10] w-full sm:aspect-[2/1]">
            <img
              src={villa.image}
              alt={villa.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-sand-50/90 text-moss-900 backdrop-blur transition-colors hover:bg-sand-50"
            >
              <X size={20} />
            </button>
            <div className="absolute bottom-4 left-4 right-4 sm:left-6">
              <p className="text-[11px] uppercase tracking-widest text-sand-200">
                {villa.location}
              </p>
              <h3 className="font-serif text-3xl text-sand-50 sm:text-4xl">
                {villa.name}
              </h3>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-moss-800/70">
              <span className="flex items-center gap-1.5">
                <BedDouble size={16} className="text-moss-600" /> {villa.bedrooms} Bedrooms
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={16} className="text-moss-600" /> Sleeps {villa.guests}
              </span>
              <span className="flex items-center gap-1.5">
                <Ruler size={16} className="text-moss-600" /> {villa.size} m²
              </span>
              <span className="ml-auto font-serif text-2xl text-moss-900">
                ${villa.price}
                <span className="ml-1 text-xs font-sans uppercase tracking-wider text-moss-800/60">
                  {villa.unit}
                </span>
              </span>
            </div>

            <p className="mt-5 leading-relaxed text-moss-800/80">{villa.description}</p>

            <h4 className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-brass-600">
              Included in your stay
            </h4>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {villa.amenities.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-moss-800/80">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-moss-100 text-moss-600">
                    <Check size={13} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 border-t border-sand-200 pt-6 sm:flex-row sm:flex-wrap">
              <Button to="/contact" onClick={onClose} className="w-full justify-center sm:w-auto">
                Book This Villa
              </Button>
              <Button to="/offers" variant="outline" onClick={onClose} className="w-full justify-center sm:w-auto">
                View Offers
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
