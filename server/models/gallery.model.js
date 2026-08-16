import pool from '../config/database.js'

export async function findAll() {
  const { rows } = await pool.query(
    'SELECT gallery_id, image_url, category, uploaded_at FROM gallery ORDER BY gallery_id',
  )
  return rows
}

export async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO gallery (image_url, category)
     VALUES ($1, $2)
     RETURNING gallery_id, image_url, category, uploaded_at`,
    [data.image_url, data.category || 'Resort'],
  )
  return rows[0]
}

export async function remove(id) {
  const { rows } = await pool.query(
    'DELETE FROM gallery WHERE gallery_id = $1 RETURNING gallery_id',
    [id],
  )
  return rows[0] || null
}
