import { useState, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { Trash2, ImageIcon, Eye, ExternalLink } from 'lucide-react'
import Loading from '../../components/ui/Loading'
import ErrorMessage from '../../components/ui/ErrorMessage'
import Modal from '../../components/admin/Modal'
import ImageUploader from '../../components/admin/ImageUploader'
import { useApi } from '../../hooks/useApi'
import { listRoomPhotos, uploadRoomPhotos, deleteRoomPhoto } from '../../api/roomPhotos'

export default function AdminRoomPhotos() {
  const { data: seed, loading, error, refetch } = useApi(listRoomPhotos)
  const [items, setItems] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [previewItem, setPreviewItem] = useState(null)

  const itemsList = items ?? seed ?? []

  const refreshItems = async () => {
    try {
      const fresh = await listRoomPhotos()
      setItems(fresh)
    } catch (err) {
      console.error('Failed to refresh room photos:', err)
    }
  }

  const handleUploadFiles = async (files) => {
    await uploadRoomPhotos(files)
    await refreshItems()
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const toastId = toast.loading('Deleting photo...')
    try {
      await deleteRoomPhoto(deleteTarget.id)
      setItems((prev) => (prev ?? seed ?? []).filter((p) => p.id !== deleteTarget.id))
      toast.success('Room photo deleted', { id: toastId })
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err.message || 'Could not delete photo', { id: toastId })
    }
  }

  if (loading && !seed) {
    return (
      <div className="space-y-5">
        <h2 className="font-display text-2xl font-bold text-moss-900">Room Photos</h2>
        <Loading />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold text-moss-900">Room Photos</h2>
        <p className="mt-1 text-sm text-moss-800/70">
          Upload and manage {itemsList.length} photos shown in the Rooms section on the public
          website.
        </p>
      </div>

      {error && <ErrorMessage error={error} onRetry={refetch} />}

      {/* Uploader */}
      <div className="rounded-3xl bg-sand-50 p-6 shadow-sm ring-1 ring-sand-200">
        <h3 className="mb-4 font-display text-lg font-bold text-moss-900">Upload Room Photos</h3>
        <ImageUploader multiple={true} categories={[]} onUpload={handleUploadFiles} />
      </div>

      {/* Grid */}
      {itemsList.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {itemsList.map((photo) => (
            <div
              key={photo.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-sand-50 ring-1 ring-sand-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand-100">
                <img
                  src={photo.src}
                  alt={photo.caption || `Room photo #${photo.id}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Hover action overlay */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-forest-950/60 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(photo)}
                    title="Preview"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-sand-50/90 text-moss-900 transition-transform hover:scale-110 hover:bg-white"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(photo)}
                    title="Delete"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600/90 text-white transition-transform hover:scale-110 hover:bg-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 text-xs text-moss-800/70">
                <span>ID: #{photo.id}</span>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(photo)}
                  className="flex items-center gap-1 font-semibold text-red-500 hover:text-red-700"
                >
                  <Trash2 size={12} /> Delete
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
            No room photos yet
          </p>
          <p className="mt-1 text-sm text-moss-800/60">
            Drag and drop files into the box above to add photos. They will appear automatically
            in the Rooms section on the public website.
          </p>
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Photo Deletion"
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
              Delete Photo
            </button>
          </>
        }
      >
        {deleteTarget && (
          <div className="space-y-3">
            <div className="aspect-[16/9] overflow-hidden rounded-xl bg-sand-100 ring-1 ring-sand-200">
              <img
                src={deleteTarget.src}
                alt={deleteTarget.caption || 'Room photo'}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="text-sm text-moss-800/80">
              Are you sure you want to permanently delete this room photo? This action cannot be
              undone.
            </p>
          </div>
        )}
      </Modal>

      {/* Preview modal */}
      <Modal
        open={previewItem !== null}
        onClose={() => setPreviewItem(null)}
        title="Room Photo Preview"
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
                alt={previewItem.caption || 'Room photo'}
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
