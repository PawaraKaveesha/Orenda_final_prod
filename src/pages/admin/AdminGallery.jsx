import { useState, useRef } from 'react'
import { toast } from 'react-hot-toast'
import {
  Trash2,
  ImageIcon,
  Copy,
  RefreshCw,
  Eye,
  Plus,
  Filter,
  Check,
  X,
  ExternalLink,
} from 'lucide-react'
import Loading from '../../components/ui/Loading'
import ErrorMessage from '../../components/ui/ErrorMessage'
import Modal from '../../components/admin/Modal'
import ImageUploader from '../../components/admin/ImageUploader'
import { useApi } from '../../hooks/useApi'
import {
  listGallery,
  addGalleryItem,
  uploadGalleryImages,
  replaceGalleryImage,
  deleteGalleryItem,
} from '../../api/gallery'

const categories = ['Beach', 'Villa', 'Interior', 'Nature', 'Wellness', 'Resort']

export default function AdminGallery() {
  const { data: seed, loading, error, refetch } = useApi(listGallery)
  const [items, setItems] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')
  
  // URL fallback form state
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [urlCategory, setUrlCategory] = useState(categories[0])
  const [addingUrl, setAddingUrl] = useState(false)
  const [showUrlForm, setShowUrlForm] = useState(false)

  // Replace file state
  const [replacingId, setReplacingId] = useState(null)
  const replaceInputRef = useRef(null)

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null)

  // View modal state
  const [previewItem, setPreviewItem] = useState(null)

  const itemsList = items ?? seed ?? []

  const filteredItems =
    activeCategory === 'All'
      ? itemsList
      : itemsList.filter((g) => g.category?.toLowerCase() === activeCategory.toLowerCase())

  // Refresh items from API
  const refreshItems = async () => {
    try {
      const fresh = await listGallery()
      setItems(fresh)
    } catch (err) {
      console.error('Failed to refresh gallery:', err)
    }
  }

  // Handle Drag and Drop / Selected Files Upload
  const handleUploadFiles = async (files, uploadCategory) => {
    await uploadGalleryImages(files, uploadCategory)
    await refreshItems()
  }

  // Handle URL string add
  const handleAddUrl = async (e) => {
    e.preventDefault()
    if (!imageUrlInput.trim()) {
      toast.error('Please enter an image URL')
      return
    }
    setAddingUrl(true)
    try {
      await addGalleryItem(imageUrlInput.trim(), urlCategory)
      await refreshItems()
      setImageUrlInput('')
      setShowUrlForm(false)
      toast.success('Image URL added to gallery')
    } catch (err) {
      toast.error(err.message || 'Could not add image')
    } finally {
      setAddingUrl(false)
    }
  }

  // Handle Image Replacement
  const triggerReplace = (id) => {
    setReplacingId(id)
    if (replaceInputRef.current) {
      replaceInputRef.current.value = ''
      replaceInputRef.current.click()
    }
  }

  const handleFileReplacement = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !replacingId) return
    const targetItem = itemsList.find((g) => g.id === replacingId)
    const categoryToUse = targetItem ? targetItem.category : 'Resort'

    const toastId = toast.loading('Replacing image...')
    try {
      await replaceGalleryImage(replacingId, file, categoryToUse)
      await refreshItems()
      toast.success('Image replaced successfully', { id: toastId })
    } catch (err) {
      toast.error(err.message || 'Could not replace image', { id: toastId })
    } finally {
      setReplacingId(null)
    }
  }

  // Handle Image Deletion
  const confirmDelete = async () => {
    if (!deleteTarget) return
    const toastId = toast.loading('Deleting image...')
    try {
      await deleteGalleryItem(deleteTarget.id)
      setItems((prev) => (prev ?? seed ?? []).filter((g) => g.id !== deleteTarget.id))
      toast.success('Image deleted', { id: toastId })
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err.message || 'Could not delete image', { id: toastId })
    }
  }

  // Copy Image URL
  const copyUrl = (src) => {
    navigator.clipboard.writeText(src)
    toast.success('Image URL copied to clipboard!')
  }

  if (loading && !seed) {
    return (
      <div className="space-y-5">
        <h2 className="font-display text-2xl font-bold text-moss-900">Gallery & Image Management</h2>
        <Loading />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hidden file input for replacing images */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileReplacement}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-moss-900">Gallery & Image Management</h2>
          <p className="mt-1 text-sm text-moss-800/70">
            Upload, replace, and manage {itemsList.length} photos shown on the public resort website.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowUrlForm((prev) => !prev)}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-sand-200 px-4 text-xs font-semibold uppercase tracking-wider text-moss-900 transition-colors hover:bg-sand-300"
        >
          {showUrlForm ? <X size={15} /> : <Plus size={15} />}
          {showUrlForm ? 'Hide URL Input' : 'Add by URL String'}
        </button>
      </div>

      {error && <ErrorMessage error={error} onRetry={refetch} />}

      {/* Drag and drop uploader */}
      <div className="rounded-3xl bg-sand-50 p-6 shadow-sm ring-1 ring-sand-200">
        <h3 className="mb-4 font-display text-lg font-bold text-moss-900">
          Upload New Images
        </h3>
        <ImageUploader
          multiple={true}
          categories={categories}
          onUpload={handleUploadFiles}
        />
      </div>

      {/* URL fallback input form */}
      {showUrlForm && (
        <form
          onSubmit={handleAddUrl}
          className="grid gap-3 rounded-2xl bg-sand-50 p-5 ring-1 ring-sand-200 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto]"
        >
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60">
              Image URL
            </span>
            <input
              type="url"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="https://example.com/photo.jpg or /images/photo.jpeg"
              className="min-h-11 w-full rounded-xl border-0 bg-sand-100 px-4 text-sm text-moss-900 ring-1 ring-sand-200 placeholder:text-moss-800/40 focus:outline-none focus:ring-2 focus:ring-moss-500"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60">
              Category
            </span>
            <select
              value={urlCategory}
              onChange={(e) => setUrlCategory(e.target.value)}
              className="min-h-11 w-full appearance-none rounded-xl border-0 bg-sand-100 px-4 text-sm text-moss-900 ring-1 ring-sand-200 focus:outline-none focus:ring-2 focus:ring-moss-500"
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
              disabled={addingUrl}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-moss-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-moss-700 disabled:opacity-60 sm:w-auto"
            >
              <Plus size={16} /> {addingUrl ? 'Adding…' : 'Add URL'}
            </button>
          </div>
        </form>
      )}

      {/* Category filter tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-sand-200/80 pb-4">
        <span className="mr-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-moss-800/60">
          <Filter size={14} /> Filter:
        </span>
        {['All', ...categories].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
              activeCategory.toLowerCase() === cat.toLowerCase()
                ? 'bg-moss-800 text-sand-50 shadow-sm'
                : 'bg-sand-200/70 text-moss-800 hover:bg-sand-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Image Gallery Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((g) => (
            <div
              key={g.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-sand-50 ring-1 ring-sand-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand-100">
                <img
                  src={g.src}
                  alt={g.alt || g.category}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <span className="absolute left-3 top-3 rounded-full bg-forest-950/80 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-sand-50 backdrop-blur">
                  {g.category}
                </span>

                {/* Hover overlay action toolbar */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-forest-950/60 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(g)}
                    title="View full image"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-sand-50/90 text-moss-900 transition-transform hover:scale-110 hover:bg-white"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => copyUrl(g.src)}
                    title="Copy image URL"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-sand-50/90 text-moss-900 transition-transform hover:scale-110 hover:bg-white"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerReplace(g.id)}
                    title="Replace with new file"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-sand-50/90 text-moss-900 transition-transform hover:scale-110 hover:bg-white"
                  >
                    <RefreshCw size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(g)}
                    title="Delete image"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600/90 text-white transition-transform hover:scale-110 hover:bg-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 text-xs text-moss-800/70">
                <span className="truncate max-w-[150px]" title={g.src}>
                  ID: #{g.id}
                </span>
                <button
                  type="button"
                  onClick={() => triggerReplace(g.id)}
                  className="flex items-center gap-1 font-semibold text-brass-600 hover:text-brass-700"
                >
                  <RefreshCw size={12} /> Replace
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-sand-50 px-6 py-16 text-center ring-1 ring-sand-200">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-moss-100 text-moss-700">
            <ImageIcon size={26} />
          </span>
          <p className="mt-4 font-display text-lg font-semibold text-moss-900">
            No gallery images found
          </p>
          <p className="mt-1 text-sm text-moss-800/60">
            Drag and drop files into the box above to add images.
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Image Deletion"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold text-moss-800 ring-1 ring-sand-300 transition-colors hover:bg-sand-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Delete Image
            </button>
          </>
        }
      >
        {deleteTarget && (
          <div className="space-y-3">
            <div className="aspect-[16/9] overflow-hidden rounded-xl bg-sand-100 ring-1 ring-sand-200">
              <img
                src={deleteTarget.src}
                alt={deleteTarget.alt}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="text-sm text-moss-800/80">
              Are you sure you want to permanently delete this {deleteTarget.category} image? This action cannot be undone.
            </p>
          </div>
        )}
      </Modal>

      {/* Fullscreen Preview Modal */}
      <Modal
        open={previewItem !== null}
        onClose={() => setPreviewItem(null)}
        title={`Image Preview (${previewItem?.category || ''})`}
        footer={
          <button
            type="button"
            onClick={() => setPreviewItem(null)}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-moss-600 px-6 text-sm font-semibold text-white hover:bg-moss-700"
          >
            Close
          </button>
        }
      >
        {previewItem && (
          <div className="space-y-3">
            <div className="max-h-[70vh] overflow-hidden rounded-xl bg-forest-950">
              <img
                src={previewItem.src}
                alt={previewItem.alt}
                className="mx-auto max-h-[70vh] w-auto object-contain"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-moss-800/70">
              <span className="font-mono">{previewItem.src}</span>
              <a
                href={previewItem.src}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 font-semibold text-brass-600 hover:underline"
              >
                Open original <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
