import pool from '../config/database.js'

const BOOKING_SELECT = `
  SELECT b.booking_id, b.guest_name, b.email, b.phone, b.villa_id, v.villa_name,
         b.check_in, b.check_out, b.guests, b.total_price, b.status, b.created_at
    FROM bookings b
    LEFT JOIN villas v ON v.villa_id = b.villa_id
`

export async function findAll() {
  const { rows } = await pool.query(`${BOOKING_SELECT} ORDER BY b.created_at DESC, b.booking_id DESC`)
  return rows
}

export async function findById(id) {
  const { rows } = await pool.query(`${BOOKING_SELECT} WHERE b.booking_id = $1`, [id])
  return rows[0] || null
}

export async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO bookings
       (guest_name, email, phone, villa_id, check_in, check_out, guests, total_price, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING booking_id`,
    [
      data.guest_name,
      data.email,
      data.phone || null,
      data.villa_id,
      data.check_in,
      data.check_out,
      data.guests,
      data.total_price,
      data.status || 'Pending',
    ],
  )
  return findById(rows[0].booking_id)
}

const ALLOWED_STATUSES = new Set(['Pending', 'Confirmed', 'Cancelled'])

export async function updateStatus(id, status) {
  if (!ALLOWED_STATUSES.has(status)) {
    const err = new Error('Status must be one of: Pending, Confirmed, Cancelled')
    err.status = 400
    throw err
  }
  const { rows } = await pool.query(
    'UPDATE bookings SET status = $2 WHERE booking_id = $1 RETURNING booking_id',
    [id, status],
  )
  return rows[0] ? findById(id) : null
}
