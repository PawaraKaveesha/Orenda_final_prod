import { useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Search, Inbox, ChevronDown } from 'lucide-react'
import StatusBadge from '../../components/admin/StatusBadge'
import Pagination from '../../components/admin/Pagination'
import InquiryDrawer from '../../components/admin/InquiryDrawer'
import Loading from '../../components/ui/Loading'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { useApi } from '../../hooks/useApi'
import {
  listInquiries,
  updateInquiryStatus,
  addInquiryNote,
  deleteInquiry,
} from '../../api/inquiries'

const PAGE_SIZE = 6
const inquiryStatuses = ['All', 'New', 'Read', 'Replied']

export default function AdminInquiries() {
  const { data: seed, loading, error, refetch } = useApi(listInquiries)
  const [items, setItems] = useState(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(null)

  const itemsList = items ?? seed ?? []

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const result = itemsList.filter((i) => {
      const matchesStatus = statusFilter === 'All' || i.status === statusFilter
      const matchesQuery =
        !q ||
        [i.id, i.name, i.email, i.phone, i.villa, i.message]
          .join(' ')
          .toLowerCase()
          .includes(q)
      return matchesStatus && matchesQuery
    })
    return result.sort((a, b) =>
      sort === 'newest'
        ? new Date(b.submittedAt) - new Date(a.submittedAt)
        : new Date(a.submittedAt) - new Date(b.submittedAt),
    )
  }, [itemsList, query, statusFilter, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const selected = itemsList.find((i) => i.id === selectedId) || null

  const patchLocal = (id, updater) => {
    setItems((prev) => {
      const base = prev ?? seed ?? []
      return base.map((i) => (i.id === id ? updater(i) : i))
    })
  }

  const updateStatus = async (id, status) => {
    try {
      const updated = await updateInquiryStatus(id.split('-')[1], status)
      patchLocal(id, () => updated)
      toast.success(`Marked as ${status}`)
    } catch (err) {
      toast.error(err.message || 'Could not update status')
    }
  }

  const removeItem = async (id) => {
    try {
      await deleteInquiry(id.split('-')[1])
      setItems((prev) => (prev ?? seed ?? []).filter((i) => i.id !== id))
      setSelectedId(null)
      toast.success('Inquiry deleted')
    } catch (err) {
      toast.error(err.message || 'Could not delete inquiry')
    }
  }

  const addNote = async (id, note) => {
    try {
      const updated = await addInquiryNote(id.split('-')[1], note)
      patchLocal(id, () => updated)
      toast.success('Note added')
    } catch (err) {
      toast.error(err.message || 'Could not add note')
    }
  }

  const resetFilters = () => {
    setQuery('')
    setStatusFilter('All')
    setSort('newest')
    setPage(1)
  }

  if (loading && !seed) {
    return (
      <div className="space-y-5">
        <h2 className="font-display text-2xl font-bold text-moss-900">Customer Inquiries</h2>
        <Loading />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-moss-900">Customer Inquiries</h2>
          <p className="mt-1 text-sm text-moss-800/70">
            {filtered.length} inquiry{filtered.length !== 1 ? 'ies' : 'y'}
            {statusFilter !== 'All' || query ? ' match your filters' : ' received'}.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative">
            <span className="sr-only">Search inquiries</span>
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-moss-800/50"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Search name, email, villa…"
              className="h-11 w-full rounded-xl border-0 bg-sand-50 pl-11 pr-4 text-sm text-moss-900 ring-1 ring-sand-200 placeholder:text-moss-800/40 focus:outline-none focus:ring-2 focus:ring-moss-500 sm:w-64"
            />
          </label>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              aria-label="Filter by status"
              className="h-11 w-full appearance-none rounded-xl border-0 bg-sand-50 pl-4 pr-10 text-sm font-medium text-moss-900 ring-1 ring-sand-200 focus:outline-none focus:ring-2 focus:ring-moss-500 sm:w-40"
            >
              {inquiryStatuses.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All statuses' : s}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-moss-800/50">
              <ChevronDown size={16} />
            </span>
          </div>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort by date"
              className="h-11 w-full appearance-none rounded-xl border-0 bg-sand-50 pl-4 pr-10 text-sm font-medium text-moss-900 ring-1 ring-sand-200 focus:outline-none focus:ring-2 focus:ring-moss-500 sm:w-40"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-moss-800/50">
              <ChevronDown size={16} />
            </span>
          </div>
        </div>
      </div>

      {error && <ErrorMessage error={error} onRetry={refetch} />}

      {pageItems.length > 0 ? (
        <div className="overflow-hidden rounded-2xl bg-sand-50 ring-1 ring-sand-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-sand-200 text-[11px] font-semibold uppercase tracking-widest text-moss-800/60">
                  <th className="py-3.5 pl-5 pr-4">Inquiry ID</th>
                  <th className="py-3.5 pr-4">Customer</th>
                  <th className="py-3.5 pr-4">Contact</th>
                  <th className="py-3.5 pr-4">Villa</th>
                  <th className="py-3.5 pr-4">Stay Dates</th>
                  <th className="py-3.5 pr-4">Guests</th>
                  <th className="py-3.5 pr-4">Message</th>
                  <th className="py-3.5 pr-4">Submitted</th>
                  <th className="py-3.5 pl-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((i) => (
                  <tr
                    key={i.id}
                    onClick={() => setSelectedId(i.id)}
                    className="cursor-pointer border-b border-sand-200/70 transition-colors last:border-0 hover:bg-moss-50"
                  >
                    <td className="whitespace-nowrap py-3.5 pl-5 pr-4 text-sm font-semibold text-brass-600">
                      {i.id}
                    </td>
                    <td className="whitespace-nowrap py-3.5 pr-4 text-sm font-semibold text-moss-900">
                      {i.name}
                    </td>
                    <td className="py-3.5 pr-4">
                      <p className="text-sm text-moss-800">{i.email}</p>
                      <p className="text-xs text-moss-800/60">{i.phone}</p>
                    </td>
                    <td className="whitespace-nowrap py-3.5 pr-4 text-sm text-moss-800">
                      {i.villa}
                    </td>
                    <td className="whitespace-nowrap py-3.5 pr-4">
                      <p className="text-sm text-moss-800">{i.checkIn}</p>
                      <p className="text-xs text-moss-800/60">→ {i.checkOut}</p>
                    </td>
                    <td className="whitespace-nowrap py-3.5 pr-4 text-sm text-moss-800">
                      {i.guests}
                    </td>
                    <td className="max-w-[220px] py-3.5 pr-4">
                      <p className="truncate text-sm text-moss-800/70" title={i.message}>
                        {i.message}
                      </p>
                    </td>
                    <td className="whitespace-nowrap py-3.5 pr-4 text-sm text-moss-800/70">
                      {new Date(i.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap py-3.5 pl-4 pr-5">
                      <StatusBadge status={i.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-sand-50 px-6 py-16 text-center ring-1 ring-sand-200">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-moss-100 text-moss-700">
            <Inbox size={26} />
          </span>
          <p className="mt-4 font-display text-lg font-semibold text-moss-900">No inquiries found</p>
          <p className="mt-1 text-sm text-moss-800/60">Try adjusting your search or filters.</p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-moss-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-moss-700"
          >
            Clear filters
          </button>
        </div>
      )}

      <Pagination page={current} totalPages={totalPages} onChange={setPage} />

      <InquiryDrawer
        inquiry={selected}
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
        onStatusChange={updateStatus}
        onDelete={removeItem}
        onAddNote={(note) => addNote(selected.id, note)}
      />
    </div>
  )
}
