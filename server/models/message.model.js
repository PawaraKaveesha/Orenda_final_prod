import mongoose from 'mongoose'
import { nextId } from './counter.model.js'
import { toJSONOptions, toNumericId } from './utils.js'

const messageSchema = new mongoose.Schema(
  {
    message_id: { type: Number, unique: true, index: true },
    sender_name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    is_read: { type: Boolean, default: false },
    received_at: { type: Date, default: Date.now },
  },
  { toJSON: toJSONOptions() },
)

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema)

export async function findAll() {
  return Message.find().sort({ received_at: -1, message_id: -1 })
}

export async function create(data) {
  return Message.create({
    message_id: await nextId('messages'),
    sender_name: data.sender_name,
    email: data.email,
    subject: data.subject,
    body: data.body,
  })
}

export async function markRead(id, read = true) {
  const messageId = toNumericId(id)
  if (messageId === null) return null
  const updated = await Message.findOneAndUpdate(
    { message_id: messageId },
    { $set: { is_read: read } },
    { new: true },
  )
  return updated || null
}

export default Message
