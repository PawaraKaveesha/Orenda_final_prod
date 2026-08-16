import pool from '../config/database.js'

const OFFER_SELECT = `
  SELECT offer_id, title, tagline, savings_label, description, discount_percentage,
         start_date, end_date, banner_image, duration, base_price, perks, is_active,
         created_at, updated_at,
         ROUND(base_price * (1 - discount_percentage / 100.0)) AS price
    FROM offers
`

export async function findAll({ activeOnly = false } = {}) {
  const where = activeOnly ? ' WHERE is_active = TRUE' : ''
  const { rows } = await pool.query(`${OFFER_SELECT}${where} ORDER BY offer_id`)
  return rows
}

export async function findById(id) {
  const { rows } = await pool.query(`${OFFER_SELECT} WHERE offer_id = $1`, [id])
  return rows[0] || null
}

export async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO offers
       (title, tagline, savings_label, description, discount_percentage, start_date,
        end_date, banner_image, duration, base_price, perks, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *, ROUND(base_price * (1 - discount_percentage / 100.0)) AS price`,
    [
      data.title,
      data.tagline || null,
      data.savings_label || null,
      data.description,
      data.discount_percentage || 0,
      data.start_date,
      data.end_date,
      data.banner_image,
      data.duration || '3 nights',
      data.base_price,
      data.perks || [],
      data.is_active ?? true,
    ],
  )
  return rows[0]
}
const UPDATABLE = new Set([
  'title',
  'tagline',
  'savings_label',
  'description',
  'discount_percentage',
  'start_date',
  'end_date',
  'banner_image',
  'duration',
  'base_price',
  'perks',
  'is_active',
])

export async function update(id, data) {
  const fields = Object.keys(data).filter((key) => UPDATABLE.has(key))
  if (fields.length === 0) return null

  const sets = fields.map((key, i) => `${key} = $${i + 2}`)
  const values = fields.map((key) => data[key])
  const { rows } = await pool.query(
    `UPDATE offers
        SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE offer_id = $1
      RETURNING *, ROUND(base_price * (1 - discount_percentage / 100.0)) AS price`,
    [id, ...values],
  )
  return rows[0] || null
}

export async function remove(id) {
  const { rows } = await pool.query(
    'DELETE FROM offers WHERE offer_id = $1 RETURNING offer_id',
    [id],
  )
  return rows[0] || null
}
