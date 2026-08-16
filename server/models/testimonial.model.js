import pool from '../config/database.js'

export async function findAll() {
  const { rows } = await pool.query(
    `SELECT testimonial_id, customer_name, country, review, rating, created_at
       FROM testimonials
      ORDER BY testimonial_id`,
  )
  return rows
}

export async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO testimonials (customer_name, country, review, rating)
     VALUES ($1, $2, $3, $4)
     RETURNING testimonial_id, customer_name, country, review, rating, created_at`,
    [data.customer_name, data.country, data.review, data.rating || 5],
  )
  return rows[0]
}

const UPDATABLE = new Set(['customer_name', 'country', 'review', 'rating'])

export async function update(id, data) {
  const fields = Object.keys(data).filter((key) => UPDATABLE.has(key))
  if (fields.length === 0) return null

  const sets = fields.map((key, i) => `${key} = $${i + 2}`)
  const values = fields.map((key) => data[key])
  const { rows } = await pool.query(
    `UPDATE testimonials
        SET ${sets.join(', ')}
      WHERE testimonial_id = $1
      RETURNING testimonial_id, customer_name, country, review, rating, created_at`,
    [id, ...values],
  )
  return rows[0] || null
}

export async function remove(id) {
  const { rows } = await pool.query(
    'DELETE FROM testimonials WHERE testimonial_id = $1 RETURNING testimonial_id',
    [id],
  )
  return rows[0] || null
}
