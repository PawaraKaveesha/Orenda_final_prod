import 'dotenv/config'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import { buildPoolConfig } from '../config/database.js'

const { Pool } = pg
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const targetDb = process.env.DB_NAME || 'orenda_galle'
const usingConnectionString = Boolean(process.env.DATABASE_URL)
const reset = process.argv.includes('--reset')

// A brand-new database is prepared in three safe steps:
//   1. ensure the schema exists (CREATE ... IF NOT EXISTS — never drops data)
//   2. insert initial content only where tables are empty (idempotent)
//   3. create the initial admin account from ADMIN_EMAIL / ADMIN_PASSWORD
// Nothing here drops, truncates or resets existing data.

async function main() {
  // --- Database creation (local DB_* mode only) ---------------------------
  // When DATABASE_URL is provided the database is provisioned externally
  // (Render, Neon, ...) and must never be created/dropped by this script.
  if (usingConnectionString) {
    if (reset) {
      throw new Error('--reset is not supported when DATABASE_URL is set. Never reset a hosted database.')
    }
    console.log('Using DATABASE_URL — database provisioning is handled by the hosting provider.')
  } else {
    const maintenance = new Pool(buildPoolConfig({ forDatabase: 'postgres' }))

    const { rowCount } = await maintenance.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      targetDb,
    ])
    if (rowCount === 0) {
      await maintenance.query(`CREATE DATABASE ${quoteIdent(targetDb)}`)
      console.log(`Created database "${targetDb}".`)
    } else if (reset) {
      // Explicit opt-in only: re-creates the LOCAL database. Never used for
      // hosted/production databases.
      await maintenance.query(
        `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
        [targetDb],
      )
      await maintenance.query(`DROP DATABASE IF EXISTS ${quoteIdent(targetDb)}`)
      await maintenance.query(`CREATE DATABASE ${quoteIdent(targetDb)}`)
      console.log(`Recreated database "${targetDb}".`)
    } else {
      console.log(`Database "${targetDb}" already exists — leaving it untouched.`)
    }
    await maintenance.end()
  }

  const pool = new Pool(buildPoolConfig())

  // --- 1. Schema -----------------------------------------------------------
  const schema = readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
  console.log('Applying schema.sql (idempotent, non-destructive) ...')
  await pool.query(schema)

  // --- 2. Seed content (only into empty tables) ----------------------------
  const seed = readFileSync(path.join(__dirname, 'seed.sql'), 'utf8')
  console.log('Applying seed.sql (only missing initial content) ...')
  await pool.query(seed)

  // --- 3. Initial admin account (env-driven, bcrypt-hashed) ----------------
  await ensureAdmin(pool)

  // --- Migrations bookkeeping ----------------------------------------------
  // The schema.sql + seed.sql already deliver the state that migrations
  // 001 and 002 produce, so record both as applied. Future migrations can
  // then run normally with `npm run db:migrate`.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  await pool.query(
    `INSERT INTO schema_migrations (filename) VALUES ('001_initial_schema.sql'), ('002_remove_bookings_messages.sql')
     ON CONFLICT (filename) DO NOTHING`,
  )

  await pool.end()
  console.log('Database is ready.')
}

async function ensureAdmin(pool) {
  const email = String(process.env.ADMIN_EMAIL || '').toLowerCase().trim()
  const password = process.env.ADMIN_PASSWORD || ''

  if (!email) {
    console.log('ADMIN_EMAIL not set — skipping admin creation. Set it and re-run to create one.')
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    console.warn(`ADMIN_EMAIL "${email}" is not a valid email address — skipping admin creation.`)
    return
  }
  if (password.length < 8) {
    console.warn('ADMIN_PASSWORD must be at least 8 characters — skipping admin creation.')
    return
  }

  const { rowCount } = await pool.query('SELECT 1 FROM admins WHERE email = $1', [email])
  if (rowCount > 0) {
    console.log(`Admin "${email}" already exists — leaving it unchanged (no password reset).`)
    return
  }

  const password_hash = await bcrypt.hash(password, 10)
  await pool.query(
    `INSERT INTO admins (full_name, email, password_hash, role, status, must_change_password)
     VALUES ($1, $2, $3, 'superadmin', 'active', TRUE)`,
    ['Orenda Administrator', email, password_hash],
  )
  console.log(`Created initial admin account for ${email} (must_change_password = true).`)
}

function quoteIdent(name) {
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    throw new Error(`Invalid database name: ${name}`)
  }
  return `"${name}"`
}

main().catch((err) => {
  console.error('Database setup failed:', err)
  process.exit(1)
})
