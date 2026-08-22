import mongoose from 'mongoose'
import { nextId } from './counter.model.js'
import { toJSONOptions, toNumericId } from './utils.js'

const gallerySchema = new mongoose.Schema(
  {
    gallery_id: { type: Number, unique: true, index: true },
    image_url: { type: String, required: true, unique: true, maxlength: 500 },
    category: { type: String, default: 'Resort', maxlength: 60 },
    uploaded_at: { type: Date, default: Date.now },
  },
  { toJSON: toJSONOptions() },
)

const Gallery = mongoose.models.Gallery || mongoose.model('Gallery', gallerySchema)

export async function findAll() {
  return Gallery.find().sort({ gallery_id: 1 })
}

export async function create(data) {
  return Gallery.create({
    gallery_id: await nextId('gallery'),
    image_url: data.image_url,
    category: data.category ?? 'Resort',
  })
}

export async function findById(id) {
  const galleryId = toNumericId(id)
  if (galleryId === null) return null
  return Gallery.findOne({ gallery_id: galleryId })
}

export async function update(id, data) {
  const galleryId = toNumericId(id)
  if (galleryId === null) return null
  const set = {}
  if (data.image_url !== undefined) set.image_url = data.image_url
  if (data.category !== undefined) set.category = data.category
  return Gallery.findOneAndUpdate({ gallery_id: galleryId }, { $set: set }, { new: true })
}

export async function remove(id) {
  const galleryId = toNumericId(id)
  if (galleryId === null) return null
  const deleted = await Gallery.findOneAndDelete({ gallery_id: galleryId })
  return deleted ? { gallery_id: deleted.gallery_id } : null
}

export default Gallery
