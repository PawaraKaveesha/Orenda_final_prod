import { useState, useRef } from 'react'
import { UploadCloud, X, Check, Loader2, Sparkles, Database } from 'lucide-react'
import { toast } from 'react-hot-toast'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_MB = 5
const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024

export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default function ImageUploader({
  multiple = true,
  categories = ['Beach', 'Villa', 'Interior', 'Nature', 'Wellness'],
  onUpload, // async function(files, category) -> returns optimization info or results
  className = '',
}) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([]) // Array of { file, previewUrl, id }
  const [category, setCategory] = useState(categories[0] || 'Resort')
  const [uploading, setUploading] = useState(false)
  const [lastOptimization, setLastOptimization] = useState(null)
  const fileInputRef = useRef(null)

  const handleFiles = (filesList) => {
    const valid = []
    const filesArr = Array.from(filesList)

    for (const file of filesArr) {
      if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
        toast.error(`"${file.name}" is not a supported format. Use JPG, PNG, WEBP, or GIF.`)
        continue
      }
      if (file.size > MAX_BYTES) {
        toast.error(`"${file.name}" exceeds the ${MAX_SIZE_MB}MB size limit.`)
        continue
      }
      valid.push({
        file,
        previewUrl: URL.createObjectURL(file),
        id: Math.random().toString(36).substring(2, 9),
      })
    }

    if (valid.length > 0) {
      setSelectedFiles((prev) => (multiple ? [...prev, ...valid] : valid))
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const removeFile = (id) => {
    setSelectedFiles((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((item) => item.id !== id)
    })
  }

  const clearAll = () => {
    selectedFiles.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
    })
    setSelectedFiles([])
  }

  const handleUploadClick = async () => {
    if (selectedFiles.length === 0) return
    setUploading(true)
    try {
      const filesToSubmit = selectedFiles.map((item) => item.file)
      const res = await onUpload(multiple ? filesToSubmit : filesToSubmit[0], category)

      // Calculate optimization metrics if returned
      let optInfo = null
      if (res && (res.optimization || (Array.isArray(res) && res[0]?.optimization))) {
        const item = res.optimization || res[0].optimization
        optInfo = {
          originalName: item.originalName,
          originalSize: item.originalSize,
          optimizedSize: item.optimizedSize,
          savedPercent: item.savedPercent,
          isDuplicate: item.isDuplicate,
        }
      }

      clearAll()
      setLastOptimization(optInfo)

      toast.success(
        filesToSubmit.length > 1
          ? `${filesToSubmit.length} images WebP-optimized and saved to MongoDB GridFS!`
          : 'Image WebP-optimized and saved to MongoDB GridFS!'
      )
    } catch (err) {
      toast.error(err.message || 'Upload failed. Please check file format or size.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drag and drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
          dragActive
            ? 'border-brass-500 bg-brass-500/10 scale-[1.01]'
            : 'border-sand-300 bg-sand-50/70 hover:border-moss-500 hover:bg-sand-100/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sand-100 text-moss-700 shadow-sm transition-transform duration-300 group-hover:scale-110">
          <UploadCloud size={28} />
        </div>

        <p className="mt-4 font-display text-base font-semibold text-moss-900">
          Drag & drop images here
        </p>
        <p className="mt-1 text-sm text-moss-800/70">
          or <span className="font-semibold text-brass-600 underline underline-offset-2">Click to browse files</span>
        </p>
        <p className="mt-2 text-xs text-moss-800/50">
          Auto-optimized to 1920x1920 WebP in MongoDB GridFS (Max {MAX_SIZE_MB}MB per file)
        </p>
      </div>

      {/* Selected Previews */}
      {selectedFiles.length > 0 && (
        <div className="rounded-2xl bg-sand-50 p-5 ring-1 ring-sand-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-moss-900">
              Selected Files ({selectedFiles.length})
            </h4>
            {categories && categories.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-moss-800/60">
                  Category:
                </span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="rounded-xl border-0 bg-sand-100 px-3 py-1.5 text-xs font-semibold text-moss-900 ring-1 ring-sand-300 focus:outline-none focus:ring-2 focus:ring-moss-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {selectedFiles.map((item) => (
              <div
                key={item.id}
                className="group relative flex items-center gap-3 overflow-hidden rounded-xl bg-sand-100/90 p-2.5 ring-1 ring-sand-200"
              >
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="h-14 w-14 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-moss-900">
                    {item.file.name}
                  </p>
                  <p className="text-[11px] text-moss-800/60">
                    Original: {formatFileSize(item.file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(item.id)
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-sand-200 text-moss-800/70 hover:bg-red-500 hover:text-white transition-colors"
                  aria-label="Remove image preview"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 border-t border-sand-200/60 pt-3">
            <button
              type="button"
              onClick={clearAll}
              disabled={uploading}
              className="inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-xs font-semibold text-moss-800 ring-1 ring-sand-300 hover:bg-sand-100 transition-colors disabled:opacity-50"
            >
              Clear selection
            </button>
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={uploading}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-brass-500 px-5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brass-600 disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Optimizing WebP & Saving…
                </>
              ) : (
                <>
                  <Check size={15} /> Upload & Optimize {selectedFiles.length} {selectedFiles.length === 1 ? 'Image' : 'Images'}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Optimization Statistics Badge */}
      {lastOptimization && (
        <div className="flex items-center justify-between rounded-2xl bg-moss-900/95 p-4 text-sand-50 ring-1 ring-moss-700 shadow-md">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brass-500/20 text-brass-400">
              <Sparkles size={20} />
            </span>
            <div>
              <p className="text-xs font-semibold text-brass-400 uppercase tracking-widest flex items-center gap-1.5">
                <Database size={13} /> MongoDB GridFS WebP Optimization
              </p>
              <p className="mt-0.5 text-xs text-sand-200">
                Original: <span className="font-semibold">{formatFileSize(lastOptimization.originalSize)}</span> &rarr; Optimized: <span className="font-semibold text-brass-400">{formatFileSize(lastOptimization.optimizedSize)}</span>
                {lastOptimization.isDuplicate && ' (Duplicate Detected)'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="rounded-full bg-brass-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brass-400">
              Saved {lastOptimization.savedPercent}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
