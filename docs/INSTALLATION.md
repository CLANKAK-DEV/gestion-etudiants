# Installation Guide

This guide walks through setting up the database, backend and frontend from scratch.

## Prerequisites

- **Node.js ≥ 18** (the project is tested on Node 22) and **npm**.
- A free **Supabase** account → [supabase.com](https://supabase.com).
- **git** (to clone the project).

---

## 1 · Get the code & install dependencies  *(first step)*

1. **Get the project** — clone the repository (or download and extract the ZIP):
   ```bash
   git clone <your-repo-url> "project angular"
   cd "project angular"
   ```
2. **Check your Node.js version** (must be ≥ 18):
   ```bash
   node -v
   ```
3. **Install both apps' dependencies** in one command from the project root:
   ```bash
   npm run install:all      # installs server/ and frontend/ dependencies
   ```
   *(Or install each separately: `cd server && npm install`, then `cd ../frontend && npm install`.)*

---

## 2 · Supabase setup

1. Sign in to Supabase and **create a new project**. Choose a region close to you and set a database password.
2. Once the project is provisioned, open **SQL Editor** in the sidebar.
3. Click **New query**, paste the contents of [`supabase/schema.sql`](../supabase/schema.sql), and **Run**. This creates:
   - the `students` table with constraints,
   - indexes (including trigram indexes for fast search),
   - an `updated_at` trigger,
   - Row Level Security (enabled, with access reserved for the trusted backend).
4. *(Optional but recommended)* Run [`supabase/seed.sql`](../supabase/seed.sql) the same way to insert **24 sample students** so the Students page has data to display immediately.
5. Go to **Project Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** secret → `SUPABASE_SERVICE_ROLE_KEY`

> 🔒 The **service-role key** is powerful and must stay on the server. It is only ever read from `server/.env` and is never bundled into the frontend.

---

## 3 · Backend setup

```bash
cd server
cp .env.example .env          # dependencies were installed in step 1
```

Edit `server/.env` and fill in your Supabase credentials:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:4200

SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVICE-ROLE-KEY

RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_MAX=300
```

Start the API:

```bash
npm run dev      # nodemon, auto-reloads on change
```

You should see:

```
🚀 Student Management API running in development mode
   → http://localhost:5000/api/health
```

Verify it: open <http://localhost:5000/api/health> — you should get a JSON health payload.

> If required environment variables are missing or malformed, the server prints a clear list of problems and exits — fix `.env` and restart.

---

## 4 · Frontend setup (Angular)

Open a **second terminal** in the `frontend/` folder:

```bash
cd frontend
npm start        # ng serve → http://localhost:4200  (deps installed in step 1)
```

That's it — open <http://localhost:4200>.

### How the frontend talks to the API

In development, [`frontend/proxy.conf.json`](../frontend/proxy.conf.json) proxies all `/api/*` requests to `http://localhost:5000`, so there are no CORS issues and no extra configuration. The Angular services call relative URLs (e.g. `/api/students`) through `HttpClient`.

---

## 5 · Run the app  *(last step)*

Run **both** servers at the same time, each in its own terminal:

| Terminal | Folder | Command | URL |
| --- | --- | --- | --- |
| 1 | `server/` | `npm run dev` | http://localhost:5000 |
| 2 | `frontend/` | `npm start` | http://localhost:4200 |

Or, from the **project root** (no folder switching):

```bash
npm run server        # terminal 1 → backend
npm run frontend      # terminal 2 → Angular app
```

➡️ **Open <http://localhost:4200>** — you should see the student list. The app is now running.

---

## 6 · Deployment

You deploy two pieces: the **Express API** and the **Angular static site**. The simplest, CORS-free setup keeps them under one origin and proxies `/api` to the API — so the app's relative `/api/...` calls keep working with **no code change**.

### 6.1 Build the front-end
```bash
cd frontend
npm run build        # outputs static files to frontend/dist/frontend/browser/
```

### 6.2 Deploy the back-end  (e.g. Render, Railway, a VPS)
- **Root directory:** `server`
- **Build command:** `npm install`
- **Start command:** `npm start`
- **Environment variables** (same keys as `server/.env`):
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  - `NODE_ENV=production`
  - `CLIENT_URL=https://YOUR-FRONTEND-DOMAIN`  *(your deployed site origin — used for CORS)*
- Note the public API URL you get, e.g. `https://your-api.onrender.com`.

### 6.3 Deploy the front-end  (e.g. Netlify, Vercel, Nginx)
Publish the contents of `frontend/dist/frontend/browser/`, and add a rewrite so `/api/*` is proxied to the deployed API (keeps it same-origin → no CORS), plus an SPA fallback so deep links like `/students/new` work.

**Netlify** — `netlify.toml`:
```toml
[build]
  command = "npm --prefix frontend install && npm --prefix frontend run build"
  publish = "frontend/dist/frontend/browser"

[[redirects]]                       # proxy API calls to the backend
  from = "/api/*"
  to = "https://your-api.onrender.com/api/:splat"
  status = 200
  force = true

[[redirects]]                       # SPA fallback (Angular routing)
  from = "/*"
  to = "/index.html"
  status = 200
```

**Vercel** — `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://your-api.onrender.com/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Nginx** (one server hosting both):
```nginx
location /api/ { proxy_pass http://127.0.0.1:5000; }
location /     { root /var/www/edumanage; try_files $uri /index.html; }
```

### 6.4 Final checks
- Backend `CLIENT_URL` matches the deployed frontend origin **exactly**.
- The SPA fallback (`/* → index.html`) is configured, or refreshing a route 404s.
- Visit `https://YOUR-API/api/health` → it returns the health JSON.
- The database schema is applied on the production Supabase project (run `supabase/setup.sql`).

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `Cannot reach the server` toast | The backend isn't running, or `CLIENT_URL`/proxy is misconfigured. |
| Server exits on boot with a config list | A required variable in `server/.env` is missing/invalid. |
| Empty stat cards & table | Run `supabase/seed.sql`, or add a student from the UI. |
| `Too many requests` | You hit the rate limit — wait, or raise `RATE_LIMIT_MAX`. |
| CORS error in browser | Set `CLIENT_URL` to match the frontend origin exactly. |
