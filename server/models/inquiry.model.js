import mongoose from 'mongoose'
import { nextId } from './counter.model.js'
import { toJSONOptions, toNumericId } from './utils.js'

const inquirySchema = new mongoose.Schema(
  {
    inquiry_id: { type: Number, unique: true, index: true },
    full_name: { type: String, required: true, maxlength: 120 },
    email: { type: String, required: true, maxlength: 255 },
    phone: { type: String, default: null, maxlength: 40 },
    villa_id: { type: Number, default: null, index: true },
    check_in: { type: String, default: null },
    check_out: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          return !v || !this.check_in || v >= this.check_in
        },
        message: 'check_out must not be before check_in',
      },
    },
    guests: { type: Number, default: 2, min: 1, max: 32 },
    message: { type: String, required: true },
    status: { type: String, enum: ['New', 'Read', 'Replied'], default: 'New', index: true },
    notes: { type: [String], default: [] },
    created_at: { type: Date, default: Date.now, index: true },
  },
  { toJSON: toJSONOptions() },
)

const Inquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema)

// Equivalent of the old LEFT JOIN villas for villa_name.
function withVillaName(pipeline) {
  return [
    ...pipeline,
    {
      $lookup: {
        from: 'villas',
        localField: 'villa_id',
        foreignField: 'villa_id',
        as: 'villa',
      },
    },
    { $addFields: { villa_name: { $arrayElemAt: ['$villa.villa_name', 0] } } },
    { $unset: ['villa', '_id'] },
  ]
}

export async function findAll() {
  return Inquiry.aggregate(withVillaName([{ $sort: { created_at: -1, inquiry_id: -1 } }]))
}

export async function findById(id) {
  const inquiryId = toNumericId(id)
  if (inquiryId === null) return null
  const rows = await Inquiry.aggregate(withVillaName([{ $match: { inquiry_id: inquiryId } }]))
  return rows[0] || null
}

export async function create(data) {
  const createdDoc = await Inquiry.create({
    inquiry_id: await nextId('inquiries'),
    full_name: data.full_name,
    email: data.email,
    phone: data.phone ?? null,
    villa_id: data.villa_id ?? null,
    check_in: data.check_in ?? null,
    check_out: data.check_out ?? null,
    guests: data.guests ?? 2,
    message: data.message,
  })
  return findById(createdDoc.inquiry_id)
}

const UPDATABLE = new Set([
  'status',
  'full_name',
  'email',
  'phone',
  'check_in',
  'check_out',
  'guests',
  'message',
])

export async function update(id, data) {
  const fields = Object.keys(data).filter((key) => UPDATABLE.has(key))
  if (fields.length === 0) return findById(id)
  const inquiryId = toNumericId(id)
  if (inquiryId === null) return null

  const set = {}
  for (const key of fields) set[key] = data[key]
  const updated = await Inquiry.findOneAndUpdate({ inquiry_id: inquiryId }, { $set: set })
  return updated ? findById(id) : null
}

export async function addNote(id, note) {
  const inquiryId = toNumericId(id)
  if (inquiryId === null) return null
  // array_append equivalent.
  const updated = await Inquiry.findOneAndUpdate(
    { inquiry_id: inquiryId },
    { $push: { notes: note } },
  )
  if (!updated) return null
  return findById(id)
}

export async function remove(id) {
  const inquiryId = toNumericId(id)
  if (inquiryId === null) return null
  const deleted = await Inquiry.findOneAndDelete({ inquiry_id: inquiryId })
  return deleted ? { inquiry_id: deleted.inquiry_id } : null
}

export default Inquiry
