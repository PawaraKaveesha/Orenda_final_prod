import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Pencil, Power, BedDouble, Users, Ruler, ChevronDown } from 'lucide-react'
import StatusBadge from '../../components/admin/StatusBadge'
import Modal from '../../components/admin/Modal'
import ImageUploader from '../../components/admin/ImageUploader'
import Loading from '../../components/ui/Loading'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { useApi } from '../../hooks/useApi'
import { listAllVillas, updateVilla } from '../../api/villas'
import { uploadSingleImage } from '../../api/upload'
import { formatLKR } from '../../utils/currency'

const inputClass =
  'min-h-11 w-full rounded-xl border-0 bg-sand-100 px-4 text-sm text-moss-900 ring-1 ring-sand-200 placeholder:text-moss-800/40 focus:outline-none focus:ring-2 focus:ring-moss-500'

const priceInputClass =
  'min-h-11 w-full rounded-xl border-0 bg-sand-100 pl-12 pr-4 text-sm text-moss-900 ring-1 ring-sand-200 placeholder:text-moss-800/40 focus:outline-none focus:ring-2 focus:ring-moss-500'

const villaAvailabilityOptions = ['Available', 'Maintenance', 'Hidden']

export default function AdminVillas() {
  const { data: seed, loading, error, refetch } = useApi(listAllVillas)
  const [items, setItems] = useState(null)
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState(null)

  const itemsList = items ?? seed ?? []

  const openEdit = (villa) => {
    setEditing(villa)
    setDraft({
      ...villa,
      image: villa.rawImage ?? villa.image ?? '',
      availability: villa.status === 'Hidden' ? 'Available' : villa.status,
      amenitiesText: Array.isArray(villa.amenities) ? villa.amenities.join(', ') : '',
    })
  }

  const closeEdit = () => {
    setEditing(null)
    setDraft(null)
  }

  const saveEdit = async () => {
    if (!draft) return
    try {
      const updated = await updateVilla(draft.id, {
        villa_name: draft.name,
        price_per_night: draft.price,
        tagline: draft.tagline,
        description: draft.description,
        max_guests: draft.guests,
        amenities: draft.amenitiesText
          ? draft.amenitiesText
              .split(',')
              .map((a) => a.trim())
              .filter(Boolean)
          : [],
        image_url: draft.image,
        status: draft.availability,
      })
      setItems((prev) => (prev ?? seed ?? []).map((v) => (v.id === draft.id ? updated : v)))
      toast.success('Villa updated')
      closeEdit()
    } catch (err) {
      toast.error(err.message || 'Could not update villa')
    }
  }

  const toggleEnabled = async (id) => {
    const current = itemsList.find((v) => v.id === id)
    if (!current) return
    const nextStatus = current.enabled ? 'Hidden' : 'Available'
    try {
      const updated = await updateVilla(id, { status: nextStatus })
      setItems((prev) => (prev ?? seed ?? []).map((v) => (v.id === id ? updated : v)))
      toast.success(current.enabled ? 'Villa hidden from public site' : 'Villa enabled')
    } catch (err) {
      toast.error(err.message || 'Could not update villa')
    }
  }

  const selectClass = `${inputClass} appearance-none`

  if (loading && !seed) {
    return (
      <div className="space-y-5">
        <h2 className="font-display text-2xl font-bold text-moss-900">Villas</h2>
        <Loading />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-moss-900">Villas</h2>
        <p className="mt-1 text-sm text-moss-800/70">
          Manage your {itemsList.length} villas, their pricing and availability.
        </p>
      </div>

      {error && <ErrorMessage error={error} onRetry={refetch} />}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {itemsList.map((villa) => (
          <article
            key={villa.id}
            className={`overflow-hidden rounded-2xl bg-sand-50 ring-1 ring-sand-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-moss-900/10 ${
              villa.enabled ? '' : 'opacity-70'
            }`}
          >
            <div className="relative h-44">
              <img
                src={villa.image}
                alt={villa.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/70 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-sand-200">
                    {villa.location}
                  </p>
                  <h3 className="font-display text-lg font-semibold text-white">{villa.name}</h3>
                </div>
                <StatusBadge status={villa.enabled ? villa.status : 'Disabled'} className="bg-sand-50/90" />
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-display text-2xl font-bold text-moss-900">
                  {formatLKR(villa.price)}
                  <span className="text-xs font-medium text-moss-800/60"> {villa.unit}</span>
                </p>
                <p className="text-xs text-moss-800/50">Updated {villa.lastUpdated}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-moss-800/70">
                <span className="flex items-center gap-1.5">
                  <BedDouble size={15} className="text-moss-600" /> {villa.bedrooms} Beds
                </span>
                <span className="flex items-center gap-1.5">
                  <Users size={15} className="text-moss-600" /> {villa.guests} Guests
                </span>
                <span className="flex items-center gap-1.5">
                  <Ruler size={15} className="text-moss-600" /> {villa.size} m²
                </span>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(villa)}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-moss-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-moss-700"
                >
                  <Pencil size={15} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => toggleEnabled(villa.id)}
                  aria-pressed={!villa.enabled}
                  className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold ring-1 transition-colors ${
                    villa.enabled
                      ? 'text-red-600 ring-red-500/40 hover:bg-red-500/10'
                      : 'text-moss-700 ring-moss-500/40 hover:bg-moss-100'
                  }`}
                >
                  <Power size={15} /> {villa.enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Modal
        open={editing !== null}
        onClose={closeEdit}
        title={draft ? `Edit ${draft.name}` : 'Edit Villa'}
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
              onClick={saveEdit}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-moss-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-moss-700"
            >
              Save changes
            </button>
          </>
        }
      >
        {draft && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="villa-name"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60"
              >
                Villa name
              </label>
              <input
                id="villa-name"
                type="text"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="villa-price"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60"
                >
                  Price (Rs. / night)
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-moss-800/50">
                    Rs.
                  </span>
                  <input
                    id="villa-price"
                    type="number"
                    min="0"
                    value={draft.price}
                    onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                    className={priceInputClass}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="villa-guests"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60"
                >
                  Max guests
                </label>
                <input
                  id="villa-guests"
                  type="number"
                  min="1"
                  value={draft.guests}
                  onChange={(e) => setDraft({ ...draft, guests: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="villa-tagline"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60"
              >
                Tagline
              </label>
              <input
                id="villa-tagline"
                type="text"
                value={draft.tagline}
                onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="villa-description"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60"
              >
                Description
              </label>
              <textarea
                id="villa-description"
                rows={4}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="villa-amenities"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60"
              >
                Amenities (comma separated)
              </label>
              <input
                id="villa-amenities"
                type="text"
                value={draft.amenitiesText}
                onChange={(e) => setDraft({ ...draft, amenitiesText: e.target.value })}
                placeholder="Ocean view, Air conditioning, Wi-Fi"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="villa-image"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60"
              >
                Main image (Drag & Drop or Enter URL)
              </label>
              <ImageUploader
                multiple={false}
                categories={[]}
                onUpload={async (file) => {
                  const res = await uploadSingleImage(file)
                  setDraft((prev) => ({ ...prev, image: res.url }))
                }}
                className="mb-3"
              />
              <input
                id="villa-image"
                type="text"
                value={draft.image}
                onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                placeholder="Image URL (populated automatically upon upload)"
                className={inputClass}
              />
            </div>

            <div className="relative">
              <label
                htmlFor="villa-availability"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60"
              >
                Status
              </label>
              <select
                id="villa-availability"
                value={draft.availability}
                onChange={(e) => setDraft({ ...draft, availability: e.target.value })}
                className={selectClass}
              >
                {villaAvailabilityOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-9 -translate-y-1/2 text-moss-800/50">
                <ChevronDown size={16} />
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
