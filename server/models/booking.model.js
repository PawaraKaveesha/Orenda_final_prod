import mongoose from 'mongoose'
import { nextId } from './counter.model.js'
import { toJSONOptions, toNumericId } from './utils.js'

const bookingSchema = new mongoose.Schema(
  {
    booking_id: { type: Number, unique: true, index: true },
    guest_name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: null },
    villa_id: { type: Number, required: true, index: true },
    check_in: { type: String, required: true },
    check_out: { type: String, required: true },
    guests: { type: Number, required: true, min: 1 },
    total_price: { type: Number, default: null, min: 0 },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' },
    created_at: { type: Date, default: Date.now },
  },
  { toJSON: toJSONOptions() },
)

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema)

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
  return Booking.aggregate(withVillaName([{ $sort: { created_at: -1, booking_id: -1 } }]))
}

export async function findById(id) {
  const bookingId = toNumericId(id)
  if (bookingId === null) return null
  const rows = await Booking.aggregate(withVillaName([{ $match: { booking_id: bookingId } }]))
  return rows[0] || null
}

export async function create(data) {
  const createdDoc = await Booking.create({
    booking_id: await nextId('bookings'),
    guest_name: data.guest_name,
    email: data.email,
    phone: data.phone ?? null,
    villa_id: data.villa_id,
    check_in: data.check_in,
    check_out: data.check_out,
    guests: data.guests,
    total_price: data.total_price ?? null,
    status: data.status ?? 'Pending',
  })
  return findById(createdDoc.booking_id)
}

const ALLOWED_STATUSES = new Set(['Pending', 'Confirmed', 'Cancelled'])

export async function updateStatus(id, status) {
  if (!ALLOWED_STATUSES.has(status)) {
    const err = new Error('Status must be one of: Pending, Confirmed, Cancelled')
    err.status = 400
    throw err
  }
  const bookingId = toNumericId(id)
  if (bookingId === null) return null
  const updated = await Booking.findOneAndUpdate(
    { booking_id: bookingId },
    { $set: { status } },
  )
  return updated ? findById(id) : null
}

export default Booking
