import { useState } from 'react'
import { BedDouble, Users, Ruler, ChevronRight, Check } from 'lucide-react'
import VillaDetailModal from './VillaDetailModal'

export default function VillaCard({ villa }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm shadow-moss-900/5 ring-1 ring-sand-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-moss-900/15">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <img
            src={villa.image}
            alt={`${villa.name} — ${villa.tagline}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <span className="absolute left-4 top-4 rounded-full bg-sand-50/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-moss-800 backdrop-blur">
            {villa.tagline}
          </span>
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-sand-50">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-sand-200">
                {villa.location}
              </p>
              <h3 className="font-serif text-3xl">{villa.name}</h3>
            </div>
            <div className="text-right">
              <p className="font-serif text-2xl text-brass-300">${villa.price}</p>
              <p className="text-[11px] uppercase tracking-wider text-sand-200">
                {villa.unit}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-moss-800/70">
            <span className="flex items-center gap-1.5">
              <BedDouble size={16} className="text-moss-600" />
              {villa.bedrooms} Beds
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={16} className="text-moss-600" />
              {villa.guests} Guests
            </span>
            <span className="flex items-center gap-1.5">
              <Ruler size={16} className="text-moss-600" />
              {villa.size} m²
            </span>
          </div>

          <p className="mt-4 flex-1 text-sm leading-relaxed text-moss-800/70">
            {villa.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {villa.amenities.slice(0, 3).map((item) => (
              <span
                key={item}
                className="flex items-center gap-1.5 rounded-full bg-moss-50 px-3 py-1 text-[11px] text-moss-700 ring-1 ring-moss-100"
              >
                <Check size={12} className="text-moss-500" />
                {item}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-6 inline-flex min-h-11 items-center gap-2 self-start text-sm font-medium uppercase tracking-wide text-brass-600 transition-colors duration-300 hover:text-brass-500"
          >
            View Details
            <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </article>

      <VillaDetailModal villa={villa} open={open} onClose={() => setOpen(false)} />
    </>
  )
}
