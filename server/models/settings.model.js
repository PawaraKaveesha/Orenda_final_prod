import pool from '../config/database.js'

const PUBLIC_KEYS = new Set([
  'resort_name',
  'resort_tagline',
  'resort_description',
  'address',
  'maps_url',
  'phone',
  'phone_secondary',
  'email',
  'email_press',
  'reception_hours',
  'concierge_hours',
  'currency',
  'check_in_time',
  'check_out_time',
  'booking_url',
  'social_instagram',
  'social_facebook',
  'social_tiktok',
])

export async function findAll({ publicOnly = false } = {}) {
  const where = publicOnly ? 'WHERE is_public = TRUE' : ''
  const { rows } = await pool.query(
    `SELECT setting_key, setting_value, is_public FROM settings ${where} ORDER BY setting_key`,
  )
  return rows
}

export async function findPublicMap() {
  const rows = await findAll({ publicOnly: true })
  return rows.reduce((acc, row) => {
    acc[row.setting_key] = row.setting_value
    return acc
  }, {})
}

export async function upsertMany(entries) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    for (const { key, value, isPublic } of entries) {
      await client.query(
        `INSERT INTO settings (setting_key, setting_value, is_public, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         ON CONFLICT (setting_key)
         DO UPDATE SET setting_value = EXCLUDED.setting_value,
                       is_public = EXCLUDED.is_public,
                       updated_at = CURRENT_TIMESTAMP`,
        [key, value ?? '', isPublic ?? PUBLIC_KEYS.has(key)],
      )
    }
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
