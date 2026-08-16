import pool from '../config/database.js'

export async function findAll() {
  const { rows } = await pool.query(
    `SELECT message_id, sender_name, email, subject, body, is_read, received_at
       FROM messages
      ORDER BY received_at DESC, message_id DESC`,
  )
  return rows
}

export async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO messages (sender_name, email, subject, body)
     VALUES ($1, $2, $3, $4)
     RETURNING message_id, sender_name, email, subject, body, is_read, received_at`,
    [data.sender_name, data.email, data.subject, data.body],
  )
  return rows[0]
}

export async function markRead(id, read = true) {
  const { rows } = await pool.query(
    'UPDATE messages SET is_read = $2 WHERE message_id = $1 RETURNING message_id',
    [id, read],
  )
  if (!rows[0]) return null
  const { rows: updated } = await pool.query(
    `SELECT message_id, sender_name, email, subject, body, is_read, received_at
       FROM messages
      WHERE message_id = $1`,
    [id],
  )
  return updated[0]
}
