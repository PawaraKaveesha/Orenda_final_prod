# Orenda Villa Resort — Database Setup Guide

Everything the backend needs to run lives in the **schema + seed files**. The
schema is applied idempotently (`CREATE TABLE IF NOT EXISTS`), the seed only
fills **empty** tables, and nothing ever drops data. Re-running setup is safe.

## Files

| File | Purpose |
|---|---|
| `server/seed/schema.sql` | Creates the full schema (8 tables + indexes) if missing. Never drops anything. |
| `server/seed/seed.sql` | Inserts starter content only into **empty** tables (3 villas, 4 offers, 12 gallery images, 6 testimonials, 18 settings, villa images). |
| `server/seed/setup.js` | Orchestrator: creates the database (local mode only), applies schema + seed, creates the initial admin, records migrations. |
| `server/migrate.js` | Applies pending files from `server/migrations/*.sql`, tracked in `schema_migrations`. |

## The 8 tables

`admins`, `villas`, `villa_images`, `inquiries`, `offers`, `gallery`,
`testimonials`, `settings`.

> Migrations `001_initial_schema.sql` and `002_remove_bookings_messages.sql`
> created then dropped `bookings` / `messages`. The final schema (above) is what
> the app uses, and it's fully covered by `schema.sql`.

---

## Local development (PostgreSQL on your machine)

### 1. Install / start PostgreSQL

Requires PostgreSQL **13+** (the app uses `pg` 8.x). On Windows you can run the
portable binaries that already exist in `.pgdata` if you set `PGDATA`:

```powershell
# Example: start the bundled local server data directory
pg_ctl -D .pgdata start
```

> The local dev password you have on this machine (`server/.env` → `DB_PASSWORD`)
> is already wired to `DB_PORT` in your `.env`. Keep that file private.

### 2. Create `server/.env`

```powershell
cd server
Copy-Item .env.example .env
```

Fill in (see comments in `.env.example`):

- `PORT=5000`, `NODE_ENV=development`
- `FRONTEND_URL=http://localhost:5173`
- `JWT_SECRET=<random>` → `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `DB_HOST`, `DB_PORT`, `DB_NAME=orenda_galle`, `DB_USER`, `DB_PASSWORD`
- Leave `DATABASE_URL` empty locally
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` (used once to seed the initial admin)

### 3. Run setup (creates db + schema + seed + admin)

```powershell
cd server
npm run db:setup
```

What it does:

1. Connects to the maintenance db (`postgres`) and **creates `orenda_galle` if
   it does not exist** (never drops it).
2. Applies `schema.sql` (idempotent).
3. Applies `seed.sql` (only fills empty tables).
4. Creates the admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (bcrypt-hashed,
   `must_change_password=true`) **if that email does not already exist**.
5. Records migrations `001` + `002` as applied so future `db:migrate` runs are
   clean.

### 4. Run migrations (future schema changes)

```powershell
cd server
npm run db:migrate
```

Add new `NNN_name.sql` files to `server/migrations/`. Applied files are tracked
in `schema_migrations`, so they run exactly once.

### 5. Force re-create a LOCAL database (explicit opt-in)

```powershell
cd server
npm run db:reset
```

**Destructive** — terminates connections and drops the database. Never run this
against a hosted / production database (it refuses to when `DATABASE_URL` is set).

### 6. Start the API

```powershell
cd server
npm run dev       # auto-restart
# or
npm start         # plain node
```

Health check: `http://localhost:5000/api/health`

---

## Production (Neon / Render Postgres)

The database is provisioned by the hosting provider, so setup takes a different
path — **no local binary, no create/drop**.

1. Copy the provider's **connection string** (TLS) into `DATABASE_URL` and set
   `DB_SSL=true`. The code detects `DATABASE_URL` automatically and skips the
   create-database step; `--reset` is refused in this mode.
2. Run once (Render Shell, or `preDeployCommand` in `render.yaml`):

   ```bash
   npm run db:setup
   ```

   → schema + seed + initial admin, same as local, but **never** creates/drops
   the database.
3. Set `ADMIN_EMAIL` / `ADMIN_PASSWORD` in the Render environment **before**
   running setup so the initial admin is created.
4. Future changes: `npm run db:migrate`.

> First-login password change is enforced (`must_change_password=true`), so the
> seeded admin password is only ever stored hashed and is invalidated on first
> sign-in.

---

## Data verification SQL (psql or any client)

```sql
-- Schema
\dt

-- Seed sanity
SELECT count(*) FROM villas;         -- 3
SELECT count(*) FROM offers;         -- 4
SELECT count(*) FROM gallery;        -- 12
SELECT count(*) FROM testimonials;   -- 6
SELECT count(*) FROM settings;       -- 18

-- Admin rows (never share hashes)
SELECT email, role, status, must_change_password FROM admins;

-- Idempotency proof: run db:setup twice, counts stay identical
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `ECONNREFUSED 127.0.0.1:5433` | Local PostgreSQL isn't running. Start it (`.pgdata`) or fix `DB_PORT`. |
| `password authentication failed` | `DB_USER` / `DB_PASSWORD` don't match the local server. Check `server/.env`. |
| `did not find any relation "villages"` etc. | Stale schema — run `npm run db:setup` then `npm run db:migrate`. |
| Setup succeeded but admin can't log in | `ADMIN_EMAIL` was empty during setup → re-run with it set. |
| `--reset is not supported when DATABASE_URL is set` | You pointed `DATABASE_URL` at a hosted db — reset is intentionally blocked. |
| Render health check reports `"db":"unavailable"` | `DATABASE_URL` / `DB_SSL` wrong, or the db host denies the Render IP. |
