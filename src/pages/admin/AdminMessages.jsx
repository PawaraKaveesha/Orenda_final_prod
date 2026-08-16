import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Mail, ChevronDown, MailOpen, Clock } from 'lucide-react'
import Modal from '../../components/admin/Modal'
import Loading from '../../components/ui/Loading'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { useApi } from '../../hooks/useApi'
import { listMessages, markMessageRead } from '../../api/messages'

export default function AdminMessages() {
  const { data: seed, loading, error, refetch } = useApi(listMessages)
  const [items, setItems] = useState(null)
  const [filter, setFilter] = useState('All')
  const [openId, setOpenId] = useState(null)

  const itemsList = items ?? seed ?? []
  const unreadCount = itemsList.filter((m) => !m.read).length
  const filtered = filter === 'All' ? itemsList : itemsList.filter((m) => (filter === 'Unread' ? !m.read : m.read))
  const open = itemsList.find((m) => m.id === openId) || null

  const markRead = async (id) => {
    if (itemsList.find((m) => m.id === id)?.read) return
    try {
      const updated = await markMessageRead(id.split('-')[1], true)
      setItems((prev) => (prev ?? seed ?? []).map((m) => (m.id === id ? updated : m)))
    } catch (err) {
      toast.error(err.message || 'Could not mark message as read')
    }
  }

  if (loading && !seed) {
    return (
      <div className="space-y-5">
        <h2 className="font-display text-2xl font-bold text-moss-900">Messages</h2>
        <Loading />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-moss-900">Messages</h2>
          <p className="mt-1 text-sm text-moss-800/70">
            {unreadCount} unread message
            {unreadCount !== 1 ? 's' : ''}.
          </p>
        </div>

        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter messages"
            className="h-11 w-full appearance-none rounded-xl border-0 bg-sand-50 pl-4 pr-10 text-sm font-medium text-moss-900 ring-1 ring-sand-200 focus:outline-none focus:ring-2 focus:ring-moss-500 sm:w-40"
          >
            <option value="All">All messages</option>
            <option value="Unread">Unread</option>
            <option value="Read">Read</option>
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-moss-800/50">
            <ChevronDown size={16} />
          </span>
        </div>
      </div>

      {error && <ErrorMessage error={error} onRetry={refetch} />}

      {filtered.length > 0 ? (
        <ul className="space-y-3">
          {filtered.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => {
                  setOpenId(m.id)
                  markRead(m.id)
                }}
                className="flex w-full items-start gap-4 rounded-2xl bg-sand-50 px-5 py-4 text-left ring-1 ring-sand-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-moss-900/10"
              >
                <span
                  className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    m.read ? 'bg-sand-200 text-moss-800/50' : 'bg-moss-100 text-moss-700'
                  }`}
                >
                  {m.read ? <MailOpen size={19} /> : <Mail size={19} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    {!m.read && (
                      <span className="rounded-full bg-brass-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brass-600 ring-1 ring-brass-500/30">
                        New
                      </span>
                    )}
                    <span className="text-sm font-semibold text-moss-900">{m.subject}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-moss-800/70">{m.body}</span>
                  <span className="mt-1.5 flex items-center gap-1.5 text-xs text-moss-800/50">
                    <Clock size={13} />
                    {m.name} · {new Date(m.receivedAt).toLocaleString()}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-sand-50 px-6 py-16 text-center ring-1 ring-sand-200">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-moss-100 text-moss-700">
            <Mail size={26} />
          </span>
          <p className="mt-4 font-display text-lg font-semibold text-moss-900">No messages</p>
          <p className="mt-1 text-sm text-moss-800/60">You are all caught up.</p>
        </div>
      )}

      <Modal
        open={open !== null}
        onClose={() => setOpenId(null)}
        title={open ? open.subject : 'Message'}
        size="lg"
      >
        {open && (
          <div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-moss-800/70">
              <span className="font-semibold text-moss-900">{open.name}</span>
              <span>{open.email}</span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} /> {new Date(open.receivedAt).toLocaleString()}
              </span>
            </div>
            <div className="mt-4 rounded-xl bg-sand-100 px-5 py-4">
              <p className="text-sm leading-relaxed text-moss-800">{open.body}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
