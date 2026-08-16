import { useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { CalendarCheck2, CalendarDays, Users, ChevronDown, Check, X } from 'lucide-react'
import StatusBadge from '../../components/admin/StatusBadge'
import Loading from '../../components/ui/Loading'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { useApi } from '../../hooks/useApi'
import { listBookings, updateBookingStatus } from '../../api/bookings'
import { listAllVillas } from '../../api/villas'
import { images } from '../../data/images'

const bookingStatuses = ['All', 'Pending', 'Confirmed', 'Cancelled']

export default function AdminBookings() {
  const { data: seed, loading, error, refetch } = useApi(listBookings)
  const { data: villas } = useApi(listAllVillas, { deps: [] })
  const [items, setItems] = useState(null)
  const [statusFilter, setStatusFilter] = useState('All')

  const itemsList = items ?? seed ?? []
  const defaultImage = images.villas.araliya

  const villaImage = useMemo(() => {
    const map = {}
    ;(villas ?? []).forEach((v) => {
      map[v.name] = v.image
    })
    return map
  }, [villas])

  const filtered = statusFilter === 'All' ? itemsList : itemsList.filter((b) => b.status === statusFilter)

  const setStatus = async (id, status) => {
    try {
      const updated = await updateBookingStatus(id.split('-')[1], status)
      setItems((prev) => (prev ?? seed ?? []).map((b) => (b.id === id ? updated : b)))
      toast.success(status === 'Confirmed' ? 'Booking confirmed' : 'Booking cancelled')
    } catch (err) {
      toast.error(err.message || 'Could not update booking')
    }
  }

  if (loading && !seed) {
    return (
      <div className="space-y-5">
        <h2 className="font-display text-2xl font-bold text-moss-900">Villa Bookings</h2>
        <Loading />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-moss-900">Villa Bookings</h2>
          <p className="mt-1 text-sm text-moss-800/70">
            {filtered.length} booking request{filtered.length !== 1 ? 's' : ''}.
          </p>
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter bookings by status"
            className="h-11 w-full appearance-none rounded-xl border-0 bg-sand-50 pl-4 pr-10 text-sm font-medium text-moss-900 ring-1 ring-sand-200 focus:outline-none focus:ring-2 focus:ring-moss-500 sm:w-44"
          >
            {bookingStatuses.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All statuses' : s}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-moss-800/50">
            <ChevronDown size={16} />
          </span>
        </div>
      </div>

      {error && <ErrorMessage error={error} onRetry={refetch} />}

      {filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((b) => (
            <article
              key={b.id}
              className="overflow-hidden rounded-2xl bg-sand-50 ring-1 ring-sand-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-moss-900/10"
            >
              <div className="relative h-32">
                <img
                  src={villaImage[b.villa] || defaultImage}
                  alt={b.villa}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-sand-50/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-moss-800 backdrop-blur">
                  {b.id}
                </span>
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <p className="font-display text-lg font-semibold text-white">{b.villa}</p>
                  <StatusBadge status={b.status} className="bg-sand-50/90" />
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-base font-semibold text-moss-900">
                    {b.guestName}
                  </h3>
                  <p className="text-sm font-bold text-moss-700">${b.total.toLocaleString()}</p>
                </div>

                <ul className="mt-4 space-y-2 text-sm text-moss-800">
                  <li className="flex items-center gap-2.5">
                    <CalendarDays size={16} className="shrink-0 text-moss-600" />
                    {b.checkIn} → {b.checkOut}
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Users size={16} className="shrink-0 text-moss-600" />
                    {b.guests} guest{b.guests !== 1 ? 's' : ''}
                  </li>
                </ul>

                <div className="mt-5 flex gap-2">
                  {b.status === 'Pending' && (
                    <button
                      type="button"
                      onClick={() => setStatus(b.id, 'Confirmed')}
                      className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-moss-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-moss-700"
                    >
                      <Check size={16} /> Confirm
                    </button>
                  )}
                  {b.status !== 'Cancelled' && (
                    <button
                      type="button"
                      onClick={() => setStatus(b.id, 'Cancelled')}
                      className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-red-600 ring-1 ring-red-500/40 transition-colors hover:bg-red-500/10"
                    >
                      <X size={16} /> Cancel
                    </button>
                  )}
                  {b.status === 'Cancelled' && (
                    <span className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-sand-100 px-4 text-sm font-medium text-moss-800/50">
                      <CalendarCheck2 size={16} /> No action
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-sand-50 px-6 py-16 text-center ring-1 ring-sand-200">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-moss-100 text-moss-700">
            <CalendarCheck2 size={26} />
          </span>
          <p className="mt-4 font-display text-lg font-semibold text-moss-900">No bookings found</p>
          <p className="mt-1 text-sm text-moss-800/60">
            {statusFilter === 'All' ? 'There are no bookings yet.' : `No ${statusFilter} bookings.`}
          </p>
        </div>
      )}
    </div>
  )
}
