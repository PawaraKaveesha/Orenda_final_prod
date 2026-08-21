import mongoose from 'mongoose'
import { nextId } from './counter.model.js'
import { toJSONOptions, toNumericId } from './utils.js'

const testimonialSchema = new mongoose.Schema(
  {
    testimonial_id: { type: Number, unique: true, index: true },
    customer_name: { type: String, required: true, maxlength: 120 },
    country: { type: String, required: true, maxlength: 80 },
    review: { type: String, required: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    created_at: { type: Date, default: Date.now },
  },
  { toJSON: toJSONOptions() },
)

const Testimonial =
  mongoose.models.Testimonial || mongoose.model('Testimonial', testimonialSchema)

export async function findAll() {
  return Testimonial.find().sort({ testimonial_id: 1 })
}

export async function create(data) {
  return Testimonial.create({
    testimonial_id: await nextId('testimonials'),
    customer_name: data.customer_name,
    country: data.country,
    review: data.review,
    rating: data.rating ?? 5,
  })
}

const UPDATABLE = new Set(['customer_name', 'country', 'review', 'rating'])

export async function update(id, data) {
  const fields = Object.keys(data).filter((key) => UPDATABLE.has(key))
  if (fields.length === 0) return null
  const testimonialId = toNumericId(id)
  if (testimonialId === null) return null

  const set = {}
  for (const key of fields) set[key] = data[key]
  return Testimonial.findOneAndUpdate({ testimonial_id: testimonialId }, { $set: set }, { new: true })
}

export async function remove(id) {
  const testimonialId = toNumericId(id)
  if (testimonialId === null) return null
  const deleted = await Testimonial.findOneAndDelete({ testimonial_id: testimonialId })
  return deleted ? { testimonial_id: deleted.testimonial_id } : null
}

export default Testimonial
