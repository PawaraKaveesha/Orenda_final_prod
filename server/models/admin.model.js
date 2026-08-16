import pool from '../config/database.js'

const PUBLIC_COLUMNS = `admin_id, full_name, email, role, status,
  must_change_password, password_changed_at, last_login, created_at`

export async function findAllPublic() {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_COLUMNS} FROM admins ORDER BY admin_id`,
  )
  return rows
}

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_COLUMNS} FROM admins WHERE admin_id = $1`,
    [id],
  )
  return rows[0] || null
}

export async function findByEmail(email) {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_COLUMNS}, password_hash FROM admins WHERE email = $1`,
    [email],
  )
  return rows[0] || null
}

export async function create({ full_name, email, password_hash, role = 'admin' }) {
  const { rows } = await pool.query(
    `INSERT INTO admins (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING ${PUBLIC_COLUMNS}`,
    [full_name, email, password_hash, role],
  )
  return rows[0]
}

export async function updatePassword(id, passwordHash) {
  const { rows } = await pool.query(
    `UPDATE admins
        SET password_hash = $2, must_change_password = FALSE, password_changed_at = CURRENT_TIMESTAMP
      WHERE admin_id = $1
      RETURNING ${PUBLIC_COLUMNS}`,
    [id, passwordHash],
  )
  return rows[0] || null
}

export async function touchLogin(id) {
  await pool.query('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE admin_id = $1', [id])
}

export async function update(id, data) {
  const fields = Object.keys(data).filter((key) =>
    ['full_name', 'email', 'role', 'status'].includes(key),
  )
  if (fields.length === 0) return null
  const sets = fields.map((key, i) => `${key} = $${i + 2}`)
  const values = fields.map((key) => data[key])
  const { rows } = await pool.query(
    `UPDATE admins SET ${sets.join(', ')} WHERE admin_id = $1 RETURNING ${PUBLIC_COLUMNS}`,
    [id, ...values],
  )
  return rows[0] || null
}

export async function remove(id) {
  const { rows } = await pool.query(
    'DELETE FROM admins WHERE admin_id = $1 RETURNING admin_id',
    [id],
  )
  return rows[0] || null
}
