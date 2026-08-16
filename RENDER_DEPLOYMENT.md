# Orenda Villa Resort — Render Deployment Guide

This guide deploys the **Express backend** to [Render](https://render.com).
The frontend (React/Vite) is deployed separately to **Cloudflare Pages**.

> Everything below uses **placeholders**. Never paste real passwords, JWT
> secrets or database credentials into files you commit or screenshots you share.

---

## Architecture

```
Local development            Production
─────────────────            ─────────────────────────────
Vite dev server   ──►   Cloudflare Pages  (React build, static)
Express API  ──►   Render Web Service   (Express, serves /api + /images)
PostgreSQL (local) ──►   Neon / Render Postgres   (managed, TLS)
```

- Repository root = the React app (build with Vite).
- `server/` = the Express API. It is the **Root directory** for the Render service.

---

## 1. Create a managed PostgreSQL database

You can use **Neon**, **Render Postgres**, or **Supabase**. Copy the connection
string (looks like `postgresql://user:password@host:5432/dbname?...`). It will
be the `DATABASE_URL` value. **TLS/SSL is enabled automatically** when
`DB_SSL=true` (or when the URL contains `sslmode=require`).

Keep the connection string private — you will paste it into Render, not into git.

---

## 2. Create the Render Web Service

1. Go to <https://dashboard.render.com> → **New** → **Web Service**.
2. **Connect a repository** → select `PawaraKaveesha/Orenda_final`.
3. Render auto-detects the Node service.

### 3. Root directory

```
server
```

This tells Render to build/run only the API (the React app lives at the root).

### 4. Build command

```
npm install
```

### 5. Start command

```
npm start
```

(`npm start` runs `node server.js` — no nodemon, no build step needed.)

### 6. Environment variables

Add every variable below. Values in `<...>` are yours to fill in.

| Variable        | Value                                                        | Secret |
|-----------------|--------------------------------------------------------------|--------|
| `NODE_ENV`      | `production`                                                 | no     |
| `PORT`          | `10000` (Render sets this automatically)                     | no     |
| `DATABASE_URL`  | `postgresql://<user>:<pass>@<host>:5432/<db>` from Neon/Render Postgres | yes |
| `DB_SSL`        | `true`                                                       | no     |
| `JWT_SECRET`    | a long random string, e.g. `openssl rand -hex 48`            | yes    |
| `ADMIN_EMAIL`   | your admin sign-in email, e.g. `you@example.com`             | no     |
| `ADMIN_PASSWORD`| strong password, **at least 8 chars**, used once to seed admin | yes |
| `FRONTEND_URL`  | your Cloudflare Pages domain, e.g. `https://orenda-galle.pages.dev` | no |

Leave `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `CORS_ORIGIN`
**empty** when using `DATABASE_URL`.

### 7. CORS configuration

The backend reads allowed browser origins from `FRONTEND_URL` (comma-separated
list supported). The frontend origin must be listed exactly:

```
FRONTEND_URL=https://orenda-galle.pages.dev
```

For local testing against the deployed API you may also include
`http://localhost:5173` in the same value:
`FRONTEND_URL=https://orenda-galle.pages.dev,http://localhost:5173`

The API never uses a wildcard `*` in production (it will log a warning if it does).

### 8. Health check URL

Render uses the endpoint for uptime monitoring and rollback detection:

```
/api/health
```

Expected response:

```json
{ "success": true, "status": "ok", "message": "Orenda API is healthy", "db": "connected", "time": "..." }
```

---

## 9. Deploy

1. Click **Create Web Service**. Render installs dependencies, runs the build
   command, then starts the service.
2. On plans that support it, the **preDeploy** step (`npm run db:setup`) runs
   automatically on every deploy before the new version goes live. It is
   idempotent and non-destructive:
   - creates the schema if missing,
   - seeds villas / offers / gallery / testimonials / settings **only if the
     tables are empty**,
   - creates the initial admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` if that
     email does not exist yet (password is bcrypt-hashed; the admin must change
     it on first login).
3. If your plan does **not** run preDeploy, do this once after the service is up
   (see **Database initialization** below).

---

## 10. Database initialization (first deploy / manual)

Run from **Render Shell** (Dashboard → your service → **Shell**) or locally:

```bash
# from server/
npm run db:setup
```

Or from the repository root:

```bash
npm run db:setup
```

This is safe to run any number of times. To see migration history later:

```bash
npm run db:migrate
```

---

## 11. Admin account setup

The initial admin is created by `db:setup` from `ADMIN_EMAIL` and
`ADMIN_PASSWORD`. On first sign-in the app forces a **password change**
(`must_change_password = true`), so the seeded password only exists transiently.

If you already seeded and need a different admin, you can add one later from the
admin dashboard's account features, or re-run `db:setup` with a different
`ADMIN_EMAIL`/`ADMIN_PASSWORD`.

---

## 12. Testing the production API

After deployment the service URL is like `https://orenda-api.onrender.com`.

```bash
# Health
curl https://orenda-api.onrender.com/api/health

# Public settings
curl https://orenda-api.onrender.com/api/settings/public

# Villas / offers / gallery / testimonials (public)
curl https://orenda-api.onrender.com/api/villas
curl "https://orenda-api.onrender.com/api/offers?active=true"
curl https://orenda-api.onrender.com/api/gallery
curl https://orenda-api.onrender.com/api/testimonials

# Admin login (returns a JWT — store it in a variable)
curl -X POST https://orenda-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<ADMIN_EMAIL>","password":"<ADMIN_PASSWORD>"}'

# Example authenticated call with the token
curl https://orenda-api.onrender.com/api/dashboard \
  -H "Authorization: Bearer <TOKEN>"

# Submit a contact-form inquiry (public)
curl -X POST https://orenda-api.onrender.com/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test Guest","email":"test@example.com","message":"Hello from the deploy check."}'
```

> Never put real credentials on the command line where they can end up in
> shell history; use your platform's secrets instead.

---

## 13. Logs

- Render: Dashboard → service → **Logs** (live).
- The app also logs to stdout (structured via Winston) and writes
  `server/logs/error.log` + `server/logs/combined.log` on the instance
  filesystem (ephemeral — for permanent storage, ship logs off-instance).
- Database errors are logged server-side; clients only ever receive a safe
  JSON `{ success: false, message }`.

---

## 14. Redeploy / updates

- Every push to the connected branch redeploys automatically (`autoDeploy: true`).
- Migrations in `server/migrations/` apply incrementally via `db:migrate`
  (already recorded by `db:setup`). Add new `.sql` files to that folder for
  future schema changes.

---

## 15. Deploying the frontend to Cloudflare Pages

1. **Build command**: `npm run build`
2. **Build output directory**: `dist`
3. **Environment variable** at build time:

   ```
   VITE_API_URL=https://orenda-api.onrender.com
   ```

   - The frontend calls `${VITE_API_URL}/api/*`.
   - Server-provided image paths (`/images/*`) are automatically prefixed with
     the same origin, so villa/gallery images load from the API.
4. Set `FRONTEND_URL=https://<your-domain>.pages.dev` on the **Render** service
   so the API accepts requests from your frontend origin.

---

## 16. Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| 502 on `/api/health` | DB unreachable — check `DATABASE_URL`, `DB_SSL=true`, network allow-list. |
| CORS error in browser | `FRONTEND_URL` on Render does not exactly match the browser origin. |
| `JWT_SECRET is required` | `JWT_SECRET` missing from Render env vars. |
| Admin login "Invalid email or password" | Admin not seeded (run `db:setup` with `ADMIN_EMAIL`/`ADMIN_PASSWORD`) or password still the seeded one. |
| Images 404 | `VITE_API_URL` not set at frontend build time. |
| Files uploaded via admin vanish after redeploy | Render disk is ephemeral. Uploads aren't wired to any route today; if you add uploads, store files in object storage, not the instance disk. |
