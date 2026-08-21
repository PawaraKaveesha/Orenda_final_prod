import mongoose from 'mongoose'

// Replaces PostgreSQL SERIAL columns: per-collection monotonically increasing
// integer IDs, allocated atomically via findOneAndUpdate + $inc.
const counterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { versionKey: false },
)

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema)

export async function nextId(name) {
  const counter = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  )
  return counter.seq
}

export default Counter
