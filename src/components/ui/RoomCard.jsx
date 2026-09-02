import { BedDouble, Users, Ruler, Check, MessageCircle } from 'lucide-react'

const roomImageModules = import.meta.glob('../../assets/images/Rooms/*.{png,jpg,jpeg,PNG,JPG,JPEG,webp,svg,gif,WEBP}', {
  eager: true,
  import: 'default',
})

export default function RoomCard({ room, onInquire }) {
  const normalizedName = room.name.split(' ')[0].toLowerCase()
  const additionalImages = Object.keys(roomImageModules)
    .filter((key) => key.toLowerCase().includes(normalizedName))
    .sort()
    .map((key) => roomImageModules[key])
    
  const allImages = additionalImages.length > 0 ? additionalImages : (room.image ? [room.image] : [])

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm shadow-moss-900/5 ring-1 ring-sand-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-moss-900/15">
      <div className="relative aspect-[4/3] w-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {allImages.map((img, idx) => (
          <div key={idx} className="relative h-full w-full shrink-0 snap-center overflow-hidden">
            <img
              src={img}
              alt={`${room.name} — ${room.tagline}`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>
        ))}
        
        <span className="absolute left-4 top-4 rounded-full bg-sand-50/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-moss-800 backdrop-blur pointer-events-none z-10">
          {room.tagline}
        </span>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 text-sand-50 pointer-events-none z-10">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-sand-200">
              {room.location}
            </p>
            <h3 className="font-serif text-3xl font-semibold">{room.name}</h3>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-semibold text-brass-300">From ${room.price || 20}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-moss-800/70">
          <span className="flex items-center gap-1.5">
            <BedDouble size={16} className="text-moss-600" />
            {room.bedrooms} Beds
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={16} className="text-moss-600" />
            {room.guests} Guests
          </span>
          <span className="flex items-center gap-1.5">
            <Ruler size={16} className="text-moss-600" />
            {room.size} m²
          </span>
        </div>

        <p className="mt-4 flex-1 text-sm leading-relaxed text-moss-800/70">
          {room.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {room.amenities.slice(0, 3).map((item) => (
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
          onClick={() => onInquire && onInquire(room)}
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full bg-moss-600 px-6 text-sm font-medium uppercase tracking-wide text-sand-50 transition-all duration-300 hover:bg-moss-500 hover:shadow-lg hover:shadow-moss-600/25"
        >
          Make an Inquiry
          <MessageCircle size={16} />
        </button>
      </div>
    </article>
  )
}
