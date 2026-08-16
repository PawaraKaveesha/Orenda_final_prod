import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { BadgePercent, Pencil, Plus, Trash2, Power } from 'lucide-react'
import Modal from '../../components/admin/Modal'
import Loading from '../../components/ui/Loading'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { useApi } from '../../hooks/useApi'
import { listOffers, createOffer, updateOffer, deleteOffer } from '../../api/offers'
import { formatLKR } from '../../utils/currency'

const inputClass =
  'min-h-11 w-full rounded-xl border-0 bg-sand-100 px-4 text-sm text-moss-900 ring-1 ring-sand-200 placeholder:text-moss-800/40 focus:outline-none focus:ring-2 focus:ring-moss-500'

const priceInputClass =
  'min-h-11 w-full rounded-xl border-0 bg-sand-100 pl-12 pr-4 text-sm text-moss-900 ring-1 ring-sand-200 placeholder:text-moss-800/40 focus:outline-none focus:ring-2 focus:ring-moss-500'

const emptyDraft = {
  name: '',
  tagline: '',
  duration: '3 nights',
  description: '',
  basePrice: 0,
  discount: 0,
  savings: '',
  image: '',
  startDate: '',
  endDate: '',
  perksText: '',
  isActive: true,
}

export default function AdminOffers() {
  const { data: seed, loading, error, refetch } = useApi(listOffers)
  const [items, setItems] = useState(null)
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)

  const itemsList = items ?? seed ?? []

  const patchList = (updated) => {
    setItems((prev) => {
      const base = prev ?? seed ?? []
      const index = base.findIndex((o) => o.id === updated.id)
      if (index === -1) return [updated, ...base]
      return base.map((o) => (o.id === updated.id ? updated : o))
    })
  }

  const removeItem = async (id) => {
    try {
      await deleteOffer(id)
      setItems((prev) => (prev ?? seed ?? []).filter((o) => o.id !== id))
      toast.success('Offer deleted')
    } catch (err) {
      toast.error(err.message || 'Could not delete offer')
    }
  }

  const toggleActive = async (offer) => {
    try {
      const updated = await updateOffer(offer.id, { is_active: !offer.isActive })
      patchList(updated)
      toast.success(updated.isActive ? 'Offer is now live' : 'Offer hidden from public site')
    } catch (err) {
      toast.error(err.message || 'Could not update offer')
    }
  }

  const openEdit = (offer) => {
    setEditing(offer)
    setDraft(
      offer
        ? {
            name: offer.name,
            tagline: offer.tagline,
            duration: offer.duration,
            description: offer.description,
            basePrice: offer.basePrice || 0,
            discount: offer.discount || 0,
            savings: offer.savings || '',
            image: offer.rawImage ?? offer.image ?? '',
            startDate: offer.startDate || '',
            endDate: offer.endDate || '',
            perksText: (offer.perks || []).join('\n'),
            isActive: offer.isActive,
          }
        : { ...emptyDraft },
    )
  }

  const closeEdit = () => {
    setEditing(null)
    setDraft(null)
  }

  const saveOffer = async () => {
    if (!draft) return
    setSaving(true)
    const payload = {
      title: draft.name,
      tagline: draft.tagline,
      duration: draft.duration,
      description: draft.description,
      base_price: Number(draft.basePrice),
      discount_percentage: Number(draft.discount),
      savings_label: draft.savings,
      banner_image: draft.image,
      start_date: draft.startDate,
      end_date: draft.endDate,
      perks: draft.perksText
        .split('\n')
        .map((p) => p.trim())
        .filter(Boolean),
      is_active: draft.isActive,
    }
    try {
      const updated = editing
        ? await updateOffer(editing.id, payload)
        : await createOffer(payload)
      patchList(updated)
      toast.success(editing ? 'Offer updated' : 'Offer created')
      closeEdit()
    } catch (err) {
      toast.error(err.message || 'Could not save offer')
    } finally {
      setSaving(false)
    }
  }

  if (loading && !seed) {
    return (
      <div className="space-y-5">
        <h2 className="font-display text-2xl font-bold text-moss-900">Offers</h2>
        <Loading />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-moss-900">Offers</h2>
          <p className="mt-1 text-sm text-moss-800/70">
            {itemsList.length} package{itemsList.length !== 1 ? 's' : ''} —{' '}
            {itemsList.filter((o) => o.isActive).length} live on the public site.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openEdit(null)}
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-moss-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-moss-700 lg:self-auto"
        >
          <Plus size={16} /> New offer
        </button>
      </div>

      {error && <ErrorMessage error={error} onRetry={refetch} />}

      {itemsList.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {itemsList.map((offer) => (
            <article
              key={offer.id}
              className={`overflow-hidden rounded-2xl bg-sand-50 ring-1 ring-sand-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-moss-900/10 ${
                offer.isActive ? '' : 'opacity-70'
              }`}
            >
              <div className="relative h-36">
                <img
                  src={offer.image}
                  alt={offer.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/70 to-transparent" />
                <span className="absolute left-3 top-3 rounded-full bg-sand-50/90 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-moss-800 backdrop-blur">
                  {offer.tagline}
                </span>
                {offer.savings && (
                  <span className="absolute right-3 top-3 rounded-full bg-brass-500 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-forest-950">
                    {offer.savings}
                  </span>
                )}
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-white">{offer.name}</h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ring-1 ${
                      offer.isActive
                        ? 'bg-moss-500/20 text-moss-200 ring-moss-400/40'
                        : 'bg-sand-200/20 text-sand-200 ring-sand-200/30'
                    }`}
                  >
                    {offer.isActive ? 'Live' : 'Hidden'}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm text-moss-800/70">{offer.duration}</p>
                  <p className="font-display text-xl font-bold text-moss-900">
                    {formatLKR(offer.price)}
                    <span className="text-xs font-medium text-moss-800/60"> total</span>
                  </p>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-moss-800/70">{offer.description}</p>

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(offer)}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-moss-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-moss-700"
                  >
                    <Pencil size={15} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleActive(offer)}
                    className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold ring-1 transition-colors ${
                      offer.isActive
                        ? 'text-red-600 ring-red-500/40 hover:bg-red-500/10'
                        : 'text-moss-700 ring-moss-500/40 hover:bg-moss-100'
                    }`}
                  >
                    <Power size={15} /> {offer.isActive ? 'Hide' : 'Publish'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(offer.id)}
                    aria-label={`Delete ${offer.name}`}
                    className="inline-flex min-h-11 w-11 items-center justify-center rounded-xl text-red-600 ring-1 ring-red-500/40 transition-colors hover:bg-red-500/10"
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
            <BadgePercent size={26} />
          </span>
          <p className="mt-4 font-display text-lg font-semibold text-moss-900">No offers yet</p>
          <p className="mt-1 text-sm text-moss-800/60">Create your first package to get started.</p>
        </div>
      )}

      <Modal
        open={draft !== null}
        onClose={closeEdit}
        title={editing ? `Edit ${editing.name}` : 'New offer'}
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
              onClick={saveOffer}
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-moss-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-moss-700 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save offer'}
            </button>
          </>
        }
      >
        {draft && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60">
                  Title
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
                  Tagline
                </label>
                <input
                  type="text"
                  value={draft.tagline}
                  onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60">
                Description
              </label>
              <textarea
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60">
                  Base price (Rs.)
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-moss-800/50">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={draft.basePrice}
                    onChange={(e) => setDraft({ ...draft, basePrice: Number(e.target.value) })}
                    className={priceInputClass}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60">
                  Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={draft.discount}
                  onChange={(e) => setDraft({ ...draft, discount: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60">
                  Savings label
                </label>
                <input
                  type="text"
                  value={draft.savings}
                  onChange={(e) => setDraft({ ...draft, savings: e.target.value })}
                  placeholder="Save 15%"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60">
                  Duration
                </label>
                <input
                  type="text"
                  value={draft.duration}
                  onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
                  placeholder="3 nights"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60">
                Banner image URL
              </label>
              <input
                type="url"
                value={draft.image}
                onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                placeholder="/images/img-05.jpeg"
                className={inputClass}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60">
                  Start date
                </label>
                <input
                  type="date"
                  value={draft.startDate}
                  onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60">
                  End date
                </label>
                <input
                  type="date"
                  value={draft.endDate}
                  onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60">
                Perks (one per line)
              </label>
              <textarea
                rows={4}
                value={draft.perksText}
                onChange={(e) => setDraft({ ...draft, perksText: e.target.value })}
                placeholder={'Private beachfront dinner\nCouples spa ritual'}
                className={inputClass}
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-sand-100 px-4 py-3 ring-1 ring-sand-200">
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                className="h-4 w-4 rounded accent-moss-600"
              />
              <span className="text-sm font-medium text-moss-900">Live on the public site</span>
            </label>
          </div>
        )}
      </Modal>
    </div>
  )
}
