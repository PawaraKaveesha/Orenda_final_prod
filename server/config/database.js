import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

// ---------------------------------------------------------------------------
// Shared PostgreSQL connection config.
//
// Prefers DATABASE_URL (used by Render, Neon, Supabase, ...). Falls back to the
// individual DB_* variables for local development.
//
// SSL: hosted providers such as Neon and Render Postgres require TLS. Enable it
// explicitly with DB_SSL=true, or by including `sslmode=require` in the URL.
// Verification is on by default; set DB_SSL_INSECURE=true only if your provider
// uses a certificate that cannot be verified (avoid in production).
// ---------------------------------------------------------------------------
export function buildPoolConfig({ forDatabase } = {}) {
  const connectionString = process.env.DATABASE_URL

  if (connectionString) {
    return { connectionString, max: 10, ssl: sslConfig(connectionString) }
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: forDatabase || process.env.DB_NAME || 'orenda_galle',
    max: 10,
    ssl: sslConfig(undefined),
  }
}

function sslConfig(connectionString) {
  const sslmode = /(^|[?&])sslmode=([a-z-]+)/i.exec(connectionString || '')
  const mode = sslmode ? sslmode[2].toLowerCase() : ''

  if (process.env.DB_SSL === 'true' || mode === 'require' || mode === 'verify-ca' || mode === 'verify-full') {
    // rejectUnauthorized stays true unless the operator explicitly opts out.
    return { rejectUnauthorized: process.env.DB_SSL_INSECURE !== 'true' }
  }
  return undefined
}

// Connection pool shared by the whole application.
export const pool = new Pool(buildPoolConfig())

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err)
})

export async function verifyConnection() {
  const { rows } = await pool.query('SELECT 1 AS connected, NOW() AS server_time')
  return rows[0]
}

export default pool
