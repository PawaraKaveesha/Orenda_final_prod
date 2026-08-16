import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Plus, Trash2, ImageIcon } from 'lucide-react'
import Loading from '../../components/ui/Loading'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { useApi } from '../../hooks/useApi'
import { listGallery, addGalleryItem, deleteGalleryItem } from '../../api/gallery'

const categories = ['Beach', 'Villa', 'Interior', 'Nature', 'Wellness']

const inputClass =
  'min-h-11 w-full rounded-xl border-0 bg-sand-100 px-4 text-sm text-moss-900 ring-1 ring-sand-200 placeholder:text-moss-800/40 focus:outline-none focus:ring-2 focus:ring-moss-500'

export default function AdminGallery() {
  const { data: seed, loading, error, refetch } = useApi(listGallery)
  const [items, setItems] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [saving, setSaving] = useState(false)

  const itemsList = items ?? seed ?? []

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!imageUrl.trim()) {
      toast.error('Please enter an image URL')
      return
    }
    setSaving(true)
    try {
      await addGalleryItem(imageUrl.trim(), category)
      setItems(await listGallery())
      setImageUrl('')
      toast.success('Image added to gallery')
    } catch (err) {
      toast.error(err.message || 'Could not add image')
    } finally {
      setSaving(false)
    }
  }

  const removeItem = async (id) => {
    try {
      await deleteGalleryItem(id)
      setItems((prev) => (prev ?? seed ?? []).filter((g) => g.id !== id))
      toast.success('Image removed from gallery')
    } catch (err) {
      toast.error(err.message || 'Could not remove image')
    }
  }

  if (loading && !seed) {
    return (
      <div className="space-y-5">
        <h2 className="font-display text-2xl font-bold text-moss-900">Gallery</h2>
        <Loading />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-moss-900">Gallery</h2>
        <p className="mt-1 text-sm text-moss-800/70">
          {itemsList.length} photo{itemsList.length !== 1 ? 's' : ''} in the public gallery.
        </p>
      </div>

      {error && <ErrorMessage error={error} onRetry={refetch} />}

      <form
        onSubmit={handleAdd}
        className="grid gap-3 rounded-2xl bg-sand-50 p-5 ring-1 ring-sand-200 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto]"
      >
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60">
            Image URL
          </span>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="/images/img-09.jpeg"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60">
            Category
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${inputClass} appearance-none`}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-moss-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-moss-700 disabled:opacity-60 sm:w-auto"
          >
            <Plus size={16} /> {saving ? 'Adding…' : 'Add image'}
          </button>
        </div>
      </form>

      {itemsList.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {itemsList.map((g) => (
            <figure
              key={g.id}
              className="group relative overflow-hidden rounded-2xl bg-sand-50 ring-1 ring-sand-200"
            >
              <img
                src={g.src}
                alt={g.alt}
                loading="lazy"
                className="aspect-[4/3] h-full w-full object-cover"
              />
              <figcaption className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-forest-950/70 via-transparent to-transparent p-4">
                <span className="self-start rounded-full bg-sand-50/90 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-moss-800 backdrop-blur">
                  {g.category}
                </span>
              </figcaption>
              <button
                type="button"
                onClick={() => removeItem(g.id)}
                aria-label={`Remove ${g.category} image`}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-sand-50/90 text-red-600 opacity-0 shadow transition-all duration-300 hover:bg-red-500 hover:text-white focus:opacity-100 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            </figure>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-sand-50 px-6 py-16 text-center ring-1 ring-sand-200">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-moss-100 text-moss-700">
            <ImageIcon size={26} />
          </span>
          <p className="mt-4 font-display text-lg font-semibold text-moss-900">No gallery images</p>
          <p className="mt-1 text-sm text-moss-800/60">Add your first photo above.</p>
        </div>
      )}
    </div>
  )
}
