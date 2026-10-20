import { useState } from 'react'
import { MessageCircle, ImageIcon } from 'lucide-react'
import { resolveImageUrl } from '../../api/client'

export default function RoomCard({ room, onInquire }) {
  const [loadFailed, setLoadFailed] = useState(false)
  const primarySrc = resolveImageUrl(
    room?.image || (Array.isArray(room?.images) && room.images.length > 0 ? room.images[0] : '')
  )
  const fallbackSrc = room?.fallbackLocalImage ? resolveImageUrl(room.fallbackLocalImage) : ''
  const displaySrc = (!loadFailed && primarySrc) ? primarySrc : (fallbackSrc || '')

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm shadow-moss-900/5 ring-1 ring-sand-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-moss-900/15">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand-100">
        {displaySrc ? (
          <div className="relative h-full w-full overflow-hidden">
            <img
              src={displaySrc}
              alt={room?.name || 'Room photo'}
              loading="lazy"
              decoding="async"
              onError={() => {
                if (!loadFailed && fallbackSrc && displaySrc !== fallbackSrc) {
                  setLoadFailed(true)
                }
              }}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>
        ) : (
          <div className="flex h-full w-full shrink-0 items-center justify-center bg-moss-100">
            <div className="text-center">
              <ImageIcon size={40} className="mx-auto text-moss-400" />
              <p className="mt-2 text-xs text-moss-500">Photo coming soon</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
        <h3 className="font-serif text-2xl font-semibold text-moss-900 sm:text-3xl">
          {room?.name}
        </h3>

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
