import pool from '../config/database.js'

const VILLA_COLUMNS = `
  v.villa_id, v.villa_name, v.tagline, v.location, v.size_sqm, v.category,
  v.description, v.price_per_night, v.max_guests, v.bedrooms, v.bathrooms,
  v.image_url, v.status, v.amenities, v.created_at, v.updated_at
`

const BASE_SELECT = `
  SELECT ${VILLA_COLUMNS}
    FROM villas v
`

export async function findAll({ includeHidden = false } = {}) {
  const where = includeHidden ? '' : " WHERE v.status <> 'Hidden'"
  const { rows } = await pool.query(`${BASE_SELECT}${where} ORDER BY v.villa_id`)
  return rows
}

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT ${VILLA_COLUMNS}
       FROM villas v
      WHERE v.villa_id = $1`,
    [id],
  )
  return rows[0] || null
}

export async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO villas
       (villa_name, tagline, location, size_sqm, category, description, price_per_night,
        max_guests, bedrooms, bathrooms, amenities, image_url, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING ${VILLA_COLUMNS.replaceAll('v.', '')}`,
    [
      data.villa_name,
      data.tagline || null,
      data.location || 'Resort Grounds',
      data.size_sqm || null,
      data.category || 'Standard',
      data.description,
      data.price_per_night,
      data.max_guests,
      data.bedrooms,
      data.bathrooms,
      data.amenities || [],
      data.image_url,
      data.status || 'Available',
    ],
  )
  return rows[0]
}

const UPDATABLE = new Set([
  'villa_name',
  'tagline',
  'location',
  'size_sqm',
  'category',
  'description',
  'price_per_night',
  'max_guests',
  'bedrooms',
  'bathrooms',
  'amenities',
  'image_url',
  'status',
])

export async function update(id, data) {
  const fields = Object.keys(data).filter((key) => UPDATABLE.has(key))
  if (fields.length === 0) return null

  const sets = fields.map((key, i) => `${key} = $${i + 2}`)
  const values = fields.map((key) => data[key])
  const { rows } = await pool.query(
    `UPDATE villas
        SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE villa_id = $1
      RETURNING ${VILLA_COLUMNS.replaceAll('v.', '')}`,
    [id, ...values],
  )
  return rows[0] || null
}

export async function remove(id) {
  const { rows } = await pool.query(
    'DELETE FROM villas WHERE villa_id = $1 RETURNING villa_id',
    [id],
  )
  return rows[0] || null
}

export async function findImages(villaId) {
  const { rows } = await pool.query(
    'SELECT image_id, villa_id, image_url, is_cover FROM villa_images WHERE villa_id = $1 ORDER BY is_cover DESC, image_id',
    [villaId],
  )
  return rows
}

export async function addImage(villaId, { image_url, is_cover = false }) {
  const { rows } = await pool.query(
    `INSERT INTO villa_images (villa_id, image_url, is_cover)
     VALUES ($1, $2, $3)
     RETURNING image_id, villa_id, image_url, is_cover`,
    [villaId, image_url, is_cover],
  )
  return rows[0]
}
