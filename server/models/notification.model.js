import mongoose from 'mongoose'
import { toJSONOptions } from './utils.js'

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  return new Date(date).toLocaleDateString()
}

const notificationSchema = new mongoose.Schema(
  {
    seen: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
  },
  { toJSON: toJSONOptions() },
)

const Notification =
  mongoose.models.Notification || mongoose.model('Notification', notificationSchema)

// Equivalent of the old LEFT JOIN villas for villa_name.
function lookupVillaName(pipeline) {
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

export async function getNotifications({ limit = 6 } = {}) {
  const db = mongoose.connection.db
  const [inquiries, messages, bookings] = await Promise.all([
    db
      .collection('inquiries')
      .aggregate(
        lookupVillaName([
          { $sort: { created_at: -1 } },
          { $limit: 3 },
          { $project: { inquiry_id: 1, full_name: 1, guests: 1, villa_name: 1, created_at: 1 } },
        ]),
      )
      .toArray(),
    db
      .collection('messages')
      .find(
        { is_read: false },
        { projection: { message_id: 1, sender_name: 1, subject: 1, received_at: 1 } },
      )
      .sort({ received_at: -1 })
      .limit(2)
      .toArray(),
    db
      .collection('bookings')
      .aggregate(
        lookupVillaName([
          { $sort: { created_at: -1 } },
          { $limit: 2 },
          { $project: { booking_id: 1, guest_name: 1, status: 1, villa_name: 1, created_at: 1 } },
        ]),
      )
      .toArray(),
  ])

  const items = []

  inquiries.forEach((row) => {
    items.push({
      id: `N-INQ-${row.inquiry_id}`,
      text: `New inquiry from ${row.full_name}`,
      detail: `${row.villa_name || 'General'} · ${row.guests} guest${row.guests > 1 ? 's' : ''}`,
      type: 'inquiry',
      time: timeAgo(row.created_at),
      read: false,
    })
  })

  messages.forEach((row) => {
    items.push({
      id: `N-MSG-${row.message_id}`,
      text: `New message from ${row.sender_name}`,
      detail: row.subject,
      type: 'message',
      time: timeAgo(row.received_at),
      read: false,
    })
  })

  bookings.forEach((row) => {
    items.push({
      id: `N-BK-${row.booking_id}`,
      text: `Booking BK-${row.booking_id} ${row.status.toLowerCase()}`,
      detail: `${row.villa_name || 'Villa'} · ${row.guest_name}`,
      type: 'booking',
      time: timeAgo(row.created_at),
      read: true,
    })
  })

  items.sort((a, b) => b.time.localeCompare(a.time))
  return items.slice(0, limit)
}

export default Notification
