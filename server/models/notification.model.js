import pool from '../config/database.js'

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

export async function getNotifications({ limit = 6 } = {}) {
  const [inquiries, messages, bookings] = await Promise.all([
    pool.query(
      `SELECT i.inquiry_id, i.full_name, i.guests, v.villa_name, i.created_at
         FROM inquiries i
         LEFT JOIN villas v ON v.villa_id = i.villa_id
        ORDER BY i.created_at DESC
        LIMIT 3`,
    ),
    pool.query(
      `SELECT message_id, sender_name, subject, received_at
         FROM messages
        WHERE is_read = FALSE
        ORDER BY received_at DESC
        LIMIT 2`,
    ),
    pool.query(
      `SELECT b.booking_id, b.guest_name, b.status, v.villa_name, b.created_at
         FROM bookings b
         LEFT JOIN villas v ON v.villa_id = b.villa_id
        ORDER BY b.created_at DESC
        LIMIT 2`,
    ),
  ])

  const items = []

  inquiries.rows.forEach((row) => {
    items.push({
      id: `N-INQ-${row.inquiry_id}`,
      text: `New inquiry from ${row.full_name}`,
      detail: `${row.villa_name || 'General'} · ${row.guests} guest${row.guests > 1 ? 's' : ''}`,
      type: 'inquiry',
      time: timeAgo(row.created_at),
      read: false,
    })
  })

  messages.rows.forEach((row) => {
    items.push({
      id: `N-MSG-${row.message_id}`,
      text: `New message from ${row.sender_name}`,
      detail: row.subject,
      type: 'message',
      time: timeAgo(row.received_at),
      read: false,
    })
  })

  bookings.rows.forEach((row) => {
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
