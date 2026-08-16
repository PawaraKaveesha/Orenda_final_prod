import pool from '../config/database.js'

const INQUIRY_SELECT = `
  SELECT i.inquiry_id, i.full_name, i.email, i.phone, i.villa_id, v.villa_name,
         i.check_in, i.check_out, i.guests, i.message, i.status, i.notes, i.created_at
    FROM inquiries i
    LEFT JOIN villas v ON v.villa_id = i.villa_id
`

export async function findAll() {
  const { rows } = await pool.query(`${INQUIRY_SELECT} ORDER BY i.created_at DESC, i.inquiry_id DESC`)
  return rows
}

export async function findById(id) {
  const { rows } = await pool.query(`${INQUIRY_SELECT} WHERE i.inquiry_id = $1`, [id])
  return rows[0] || null
}

export async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO inquiries
       (full_name, email, phone, villa_id, check_in, check_out, guests, message)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING inquiry_id`,
    [
      data.full_name,
      data.email,
      data.phone || null,
      data.villa_id || null,
      data.check_in || null,
      data.check_out || null,
      data.guests || 2,
      data.message,
    ],
  )
  return findById(rows[0].inquiry_id)
}

const UPDATABLE = new Set(['status', 'full_name', 'email', 'phone', 'check_in', 'check_out', 'guests', 'message'])

export async function update(id, data) {
  const fields = Object.keys(data).filter((key) => UPDATABLE.has(key))
  if (fields.length === 0) return findById(id)

  const sets = fields.map((key, i) => `${key} = $${i + 2}`)
  const values = fields.map((key) => data[key])
  const { rows } = await pool.query(
    `UPDATE inquiries SET ${sets.join(', ')} WHERE inquiry_id = $1 RETURNING inquiry_id`,
    [id, ...values],
  )
  return rows[0] ? findById(id) : null
}

export async function addNote(id, note) {
  const { rows } = await pool.query(
    `UPDATE inquiries
        SET notes = array_append(COALESCE(notes, '{}'), $2)
      WHERE inquiry_id = $1
      RETURNING notes`,
    [id, note],
  )
  if (!rows[0]) return null
  return findById(id)
}

export async function remove(id) {
  const { rows } = await pool.query(
    'DELETE FROM inquiries WHERE inquiry_id = $1 RETURNING inquiry_id',
    [id],
  )
  return rows[0] || null
}
