import mongoose from 'mongoose'
import { nextId } from './counter.model.js'
import { toJSONOptions, toNumericId } from './utils.js'

const offerSchema = new mongoose.Schema(
  {
    offer_id: { type: Number, unique: true, index: true },
    title: { type: String, required: true, maxlength: 120 },
    tagline: { type: String, default: null, maxlength: 80 },
    savings_label: { type: String, default: null, maxlength: 80 },
    description: { type: String, required: true },
    discount_percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    start_date: { type: String, required: true },
    end_date: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return !this.start_date || v >= this.start_date
        },
        message: 'end_date must not be before start_date',
      },
    },
    banner_image: { type: String, required: true, maxlength: 500 },
    duration: { type: String, default: '3 nights', maxlength: 40 },
    base_price: {
      type: Number,
      required: true,
      validate: {
        validator: (v) => v > 0,
        message: 'base_price must be greater than 0',
      },
    },
    perks: { type: [String], default: [] },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    toJSON: { ...toJSONOptions(), virtuals: true },
  },
)

// Mirrors the old SQL computed column:
//   ROUND(base_price * (1 - discount_percentage / 100.0)) AS price
offerSchema.virtual('price').get(function () {
  return Math.round(this.base_price * (1 - this.discount_percentage / 100))
})

const Offer = mongoose.models.Offer || mongoose.model('Offer', offerSchema)

export async function findAll({ activeOnly = false } = {}) {
  const filter = activeOnly ? { is_active: true } : {}
  return Offer.find(filter).sort({ offer_id: 1 })
}

export async function findById(id) {
  const offerId = toNumericId(id)
  if (offerId === null) return null
  return Offer.findOne({ offer_id: offerId })
}

export async function create(data) {
  return Offer.create({
    offer_id: await nextId('offers'),
    title: data.title,
    tagline: data.tagline ?? null,
    savings_label: data.savings_label ?? null,
    description: data.description,
    discount_percentage: data.discount_percentage ?? 0,
    start_date: data.start_date,
    end_date: data.end_date,
    banner_image: data.banner_image,
    duration: data.duration ?? '3 nights',
    base_price: data.base_price,
    perks: data.perks ?? [],
    is_active: data.is_active ?? true,
  })
}

const UPDATABLE = new Set([
  'title',
  'tagline',
  'savings_label',
  'description',
  'discount_percentage',
  'start_date',
  'end_date',
  'banner_image',
  'duration',
  'base_price',
  'perks',
  'is_active',
])

export async function update(id, data) {
  const fields = Object.keys(data).filter((key) => UPDATABLE.has(key))
  if (fields.length === 0) return null
  const offerId = toNumericId(id)
  if (offerId === null) return null

  // Validate the end_date >= start_date constraint against the merged state.
  const current = await Offer.findOne({ offer_id: offerId })
  if (!current) return null
  const merged = {
    start_date: fields.includes('start_date') ? data.start_date : current.start_date,
    end_date: fields.includes('end_date') ? data.end_date : current.end_date,
  }
  if (merged.end_date < merged.start_date) {
    const err = new Error('One of the provided values violates a constraint.')
    err.status = 400
    throw err
  }

  const set = {}
  for (const key of fields) set[key] = data[key]
  set.updated_at = new Date()

  return Offer.findOneAndUpdate({ offer_id: offerId }, { $set: set }, { new: true })
}

export async function remove(id) {
  const offerId = toNumericId(id)
  if (offerId === null) return null
  const deleted = await Offer.findOneAndDelete({ offer_id: offerId })
  return deleted ? { offer_id: deleted.offer_id } : null
}

export default Offer
