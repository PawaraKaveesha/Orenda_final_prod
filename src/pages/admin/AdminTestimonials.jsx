import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { MessageSquareQuote, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import Modal from '../../components/admin/Modal'
import Loading from '../../components/ui/Loading'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { useApi } from '../../hooks/useApi'
import {
  listTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../../api/testimonials'

const inputClass =
  'min-h-11 w-full rounded-xl border-0 bg-sand-100 px-4 text-sm text-moss-900 ring-1 ring-sand-200 placeholder:text-moss-800/40 focus:outline-none focus:ring-2 focus:ring-moss-500'

const emptyDraft = { name: '', location: '', rating: 5, quote: '' }

export default function AdminTestimonials() {
  const { data: seed, loading, error, refetch } = useApi(listTestimonials)
  const [items, setItems] = useState(null)
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)

  const itemsList = items ?? seed ?? []

  const patchList = (updated) => {
    setItems((prev) => {
      const base = prev ?? seed ?? []
      const index = base.findIndex((t) => t.id === updated.id)
      if (index === -1) return [updated, ...base]
      return base.map((t) => (t.id === updated.id ? updated : t))
    })
  }

  const removeItem = async (id) => {
    try {
      await deleteTestimonial(id)
      setItems((prev) => (prev ?? seed ?? []).filter((t) => t.id !== id))
      toast.success('Testimonial deleted')
    } catch (err) {
      toast.error(err.message || 'Could not delete testimonial')
    }
  }

  const openEdit = (testimonial) => {
    setEditing(testimonial)
    setDraft(
      testimonial
        ? {
            name: testimonial.name,
            location: testimonial.location,
            rating: testimonial.rating,
            quote: testimonial.quote,
          }
        : { ...emptyDraft },
    )
  }

  const closeEdit = () => {
    setEditing(null)
    setDraft(null)
  }

  const saveTestimonial = async () => {
    if (!draft) return
    setSaving(true)
    const payload = {
      customer_name: draft.name,
      country: draft.location,
      rating: Number(draft.rating),
      review: draft.quote,
    }
    try {
      const updated = editing
        ? await updateTestimonial(editing.id, payload)
        : await createTestimonial(payload)
      patchList(updated)
      toast.success(editing ? 'Testimonial updated' : 'Testimonial added')
      closeEdit()
    } catch (err) {
      toast.error(err.message || 'Could not save testimonial')
    } finally {
      setSaving(false)
    }
  }

  if (loading && !seed) {
    return (
      <div className="space-y-5">
        <h2 className="font-display text-2xl font-bold text-moss-900">Testimonials</h2>
        <Loading />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-moss-900">Testimonials</h2>
          <p className="mt-1 text-sm text-moss-800/70">
            {itemsList.length} guest review{itemsList.length !== 1 ? 's' : ''} on the public site.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openEdit(null)}
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-moss-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-moss-700 lg:self-auto"
        >
          <Plus size={16} /> Add testimonial
        </button>
      </div>

      {error && <ErrorMessage error={error} onRetry={refetch} />}

      {itemsList.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {itemsList.map((t) => (
            <article
              key={t.id}
              className="flex h-full flex-col rounded-2xl bg-sand-50 p-5 ring-1 ring-sand-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-moss-900/10"
            >
              <div className="flex gap-1 text-brass-500">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <blockquote className="mt-3 flex-1 font-serif text-base italic leading-relaxed text-moss-800">
                “{t.quote}”
              </blockquote>
              <div className="mt-5 flex items-center gap-3 border-t border-sand-200 pt-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-moss-100 font-serif text-lg text-moss-700">
                  {t.name.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-moss-900">{t.name}</p>
                  <p className="truncate text-xs uppercase tracking-wider text-moss-800/60">
                    {t.location}
                  </p>
                </div>
                <div className="ml-auto flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(t)}
                    aria-label={`Edit testimonial from ${t.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-moss-700 ring-1 ring-sand-200 transition-colors hover:bg-moss-100"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(t.id)}
                    aria-label={`Delete testimonial from ${t.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-red-600 ring-1 ring-red-500/40 transition-colors hover:bg-red-500/10"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-sand-50 px-6 py-16 text-center ring-1 ring-sand-200">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-moss-100 text-moss-700">
            <MessageSquareQuote size={26} />
          </span>
          <p className="mt-4 font-display text-lg font-semibold text-moss-900">
            No testimonials yet
          </p>
          <p className="mt-1 text-sm text-moss-800/60">Add your first guest review.</p>
        </div>
      )}

      <Modal
        open={draft !== null}
        onClose={closeEdit}
        title={editing ? `Edit testimonial from ${editing.name}` : 'Add testimonial'}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={closeEdit}
              className="inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold text-moss-800 ring-1 ring-sand-300 transition-colors hover:bg-sand-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveTestimonial}
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-moss-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-moss-700 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save testimonial'}
            </button>
          </>
        }
      >
        {draft && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60">
                  Guest name
                </label>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60">
                  Location
                </label>
                <input
                  type="text"
                  value={draft.location}
                  onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                  placeholder="London, UK"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60">
                Rating
              </label>
              <select
                value={draft.rating}
                onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}
                className={`${inputClass} appearance-none`}
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} star{r !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60">
                Review
              </label>
              <textarea
                rows={4}
                value={draft.quote}
                onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
