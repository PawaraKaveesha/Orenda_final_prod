import mongoose from 'mongoose'
import { nextId } from './counter.model.js'
import { toJSONOptions, toNumericId } from './utils.js'

const villaSchema = new mongoose.Schema(
  {
    villa_id: { type: Number, unique: true, index: true },
    villa_name: { type: String, required: true, unique: true, maxlength: 120 },
    tagline: { type: String, default: null, maxlength: 120 },
    location: { type: String, default: 'Resort Grounds', maxlength: 120 },
    size_sqm: { type: Number, default: null, min: 1 },
    category: { type: String, enum: ['Standard', 'Deluxe', 'Family'], default: 'Standard' },
    description: { type: String, required: true },
    price_per_night: {
      type: Number,
      required: true,
      validate: {
        validator: (v) => v > 0,
        message: 'price_per_night must be greater than 0',
      },
    },
    max_guests: { type: Number, required: true, min: 1, max: 16 },
    bedrooms: { type: Number, required: true, min: 1 },
    bathrooms: { type: Number, required: true, min: 1 },
    amenities: { type: [String], default: [] },
    image_url: { type: String, required: true, maxlength: 500 },
    status: {
      type: String,
      enum: ['Available', 'Maintenance', 'Hidden'],
      default: 'Available',
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { toJSON: toJSONOptions() },
)

const Villa = mongoose.models.Villa || mongoose.model('Villa', villaSchema)

const villaImageSchema = new mongoose.Schema(
  {
    image_id: { type: Number, unique: true, index: true },
    villa_id: { type: Number, required: true, index: true },
    image_url: { type: String, required: true, maxlength: 500 },
    is_cover: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
  },
  { toJSON: toJSONOptions() },
)

const VillaImage =
  mongoose.models.VillaImage || mongoose.model('VillaImage', villaImageSchema)

export async function findAll({ includeHidden = false } = {}) {
  const filter = includeHidden ? {} : { status: { $ne: 'Hidden' } }
  return Villa.find(filter).sort({ villa_id: 1 })
}

export async function findById(id) {
  const villaId = toNumericId(id)
  if (villaId === null) return null
  return Villa.findOne({ villa_id: villaId })
}

export async function create(data) {
  return Villa.create({
    villa_id: await nextId('villas'),
    villa_name: data.villa_name,
    tagline: data.tagline ?? null,
    location: data.location ?? 'Resort Grounds',
    size_sqm: data.size_sqm ?? null,
    category: data.category ?? 'Standard',
    description: data.description,
    price_per_night: data.price_per_night,
    max_guests: data.max_guests,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    amenities: data.amenities ?? [],
    image_url: data.image_url,
    status: data.status ?? 'Available',
  })
}

const UPDATABLE = new Set([
  'villa_name',
  'tagline',
  'location',
  'size_sqm',
  'category',
  'description',
  'price_per_night',
  'max_guests',
  'bedrooms',
  'bathrooms',
  'amenities',
  'image_url',
  'status',
])

export async function update(id, data) {
  const fields = Object.keys(data).filter((key) => UPDATABLE.has(key))
  if (fields.length === 0) return null
  const villaId = toNumericId(id)
  if (villaId === null) return null

  const set = {}
  for (const key of fields) set[key] = data[key]
  set.updated_at = new Date()

  return Villa.findOneAndUpdate({ villa_id: villaId }, { $set: set }, { new: true })
}

export async function remove(id) {
  const villaId = toNumericId(id)
  if (villaId === null) return null
  const deleted = await Villa.findOneAndDelete({ villa_id: villaId })
  if (!deleted) return null
  // ON DELETE CASCADE equivalent for the villa's extra images.
  await VillaImage.deleteMany({ villa_id: villaId })
  return { villa_id: deleted.villa_id }
}

export async function findImages(villaId) {
  const id = toNumericId(villaId)
  if (id === null) return []
  return VillaImage.find({ villa_id: id }).sort({ is_cover: -1, image_id: 1 })
}

export async function addImage(villaId, { image_url, is_cover = false }) {
  return VillaImage.create({
    image_id: await nextId('villa_images'),
    villa_id: toNumericId(villaId),
    image_url,
    is_cover,
  })
}

export default Villa
export { VillaImage }
