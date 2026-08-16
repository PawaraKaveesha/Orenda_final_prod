import 'dotenv/config'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { buildPoolConfig } from './config/database.js'

const { Pool } = pg
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const migrationsDir = path.join(__dirname, 'migrations')

function quoteIdent(name) {
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    throw new Error(`Invalid database name: ${name}`)
  }
  return `"${name}"`
}

async function main() {
  // Runs against the configured application database (DATABASE_URL or DB_*).
  const pool = new Pool(buildPoolConfig())

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename      VARCHAR(255) PRIMARY KEY,
      applied_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  const { rows } = await pool.query('SELECT filename FROM schema_migrations')
  const applied = new Set(rows.map((r) => r.filename))

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  let count = 0
  for (const file of files) {
    if (applied.has(file)) continue
    const sql = readFileSync(path.join(migrationsDir, file), 'utf8')
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file])
      await client.query('COMMIT')
      console.log(`Applied migration ${file}`)
      count += 1
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  }

  await pool.end()
  console.log(count === 0 ? 'No pending migrations.' : `Applied ${count} migration(s).`)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
