import mongoose from 'mongoose'
import { nextId } from './counter.model.js'
import { toJSONOptions, toNumericId } from './utils.js'

const roomPhotoSchema = new mongoose.Schema(
  {
    room_photo_id: { type: Number, unique: true, index: true },
    image_url: { type: String, required: true, maxlength: 500 },
    caption: { type: String, default: '', maxlength: 200 },
    uploaded_at: { type: Date, default: Date.now },
  },
  { toJSON: toJSONOptions() },
)

const RoomPhoto =
  mongoose.models.RoomPhoto || mongoose.model('RoomPhoto', roomPhotoSchema)

export async function findAll() {
  return RoomPhoto.find().sort({ room_photo_id: 1 })
}

export async function create(data) {
  return RoomPhoto.create({
    room_photo_id: await nextId('room_photos'),
    image_url: data.image_url,
    caption: data.caption ?? '',
  })
}

export async function findById(id) {
  const photoId = toNumericId(id)
  if (photoId === null) return null
  return RoomPhoto.findOne({ room_photo_id: photoId })
}

export async function remove(id) {
  const photoId = toNumericId(id)
  if (photoId === null) return null
  const deleted = await RoomPhoto.findOneAndDelete({ room_photo_id: photoId })
  return deleted ? { room_photo_id: deleted.room_photo_id } : null
}

export default RoomPhoto
