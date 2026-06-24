# Code Reference — file by file

A complete walkthrough of every important file in the project, grouped by layer.
For deeper topic docs see: [Project Overview](PROJECT_OVERVIEW.md) · [API Reference](API.md) · [Database](DATABASE.md) · [Validation & Security](VALIDATION_SECURITY.md) · [Filters & Search](FILTERS_SEARCH.md) · [Export](EXPORT.md) · [UI/UX](UI_UX.md) · [Installation](INSTALLATION.md).

---

## 1. Tools & technologies

| Area | Tool | Why it's used |
| --- | --- | --- |
| Front-end framework | **Angular 17** (standalone components) | SPA, routing, dependency injection, typed templates |
| Styling | **Bootstrap 5** | Responsive grid, table, forms, modals, pagination |
| Reactive streams | **RxJS** | Debounced search, HTTP observables |
| HTTP | **Angular HttpClient** + interceptor | Calls the REST API, normalises errors |
| Exports | **jsPDF** + **jspdf-autotable**, **SheetJS (xlsx)** | PDF and Excel export of the student list |
| Back-end runtime | **Node.js** | JavaScript server runtime (ESM modules) |
| Web framework | **Express 4** | Routing, middleware pipeline |
| Validation | **Zod** | Schema validation + type coercion of all input |
| Security | **Helmet**, **CORS**, **express-rate-limit**, custom sanitizer | HTTP hardening, origin control, abuse limiting, XSS defence |
| Logging / perf | **Morgan**, **compression** | Request logs, gzip responses |
| Database | **Supabase (PostgreSQL)** via `@supabase/supabase-js` | Managed Postgres, parameterised queries |
| Config | **dotenv** | Loads `server/.env` |

---

## 2. Architecture & request lifecycle

```
Browser (Angular @ :4200)
   │  component → Angular service (HttpClient)  →  GET/POST/PUT/DELETE /api/...
   │  (dev: ng serve proxies /api → :5000 via proxy.conf.json)
   ▼
Express API (@ :5000)
   helmet → cors → compression → json/urlencoded → morgan
        → sanitizeRequest → rate-limit (/api)
        → route → validate(schema) → controller → service
                                                     │
                                                     ▼
                                          Supabase JS SDK (parameterised)
                                                     │
                                                     ▼
                                          PostgreSQL (students table)
   ◀── sendSuccess({success,data,meta})  |  errorHandler({success,message,errors?})
```

**Backend layering** keeps each file single-purpose:
`routes` (URL → handler) → `controllers` (thin glue) → `services` (data access + logic) → `Supabase`.
Cross-cutting concerns live in `middleware` (sanitize, validate, error, 404) and `utils` (ApiError, ApiResponse, asyncHandler).

---

## 3. Folder structure (architecture schema)

### 3.1 Top level

```
project angular/
├── frontend/        →  Angular 17 application (the client / UI)
├── server/          →  Node.js + Express REST API (the back-end)
├── supabase/        →  SQL scripts for the PostgreSQL database
├── docs/            →  Project documentation (this folder)
├── package.json     →  Root orchestrator scripts (install/run both apps)
├── README.md        →  Project intro + quick start
└── .gitignore
```

| Folder | Responsibility | Talks to |
| --- | --- | --- |
| `frontend/` | Renders the UI, collects input, calls the API | → `server/` over HTTP `/api` |
| `server/` | Validates, applies business logic, persists data | → `supabase/` (PostgreSQL) |
| `supabase/` | Database schema + seed data | — |
| `docs/` | Human documentation | — |

### 3.2 Front-end (`frontend/src/`)

```
frontend/
├── angular.json            →  Angular CLI build/serve config (assets, styles, budgets)
├── proxy.conf.json         →  Dev proxy: forwards /api → http://localhost:5000
├── package.json            →  Front-end dependencies + scripts (ng serve/build)
├── tsconfig*.json          →  TypeScript compiler settings
└── src/
    ├── main.ts             →  App bootstrap (loads AppComponent)
    ├── index.html          →  Host page + favicons + pre-paint theme script
    ├── styles.scss         →  Bootstrap import, theme variables, dark overrides, icon classes
    ├── favicon.ico
    ├── assets/             →  Static files served as-is
    │   ├── logo.png
    │   ├── favicon-32.png · apple-touch-icon.png
    │   └── icons/          →  UI icons (add, edit, delete, export-*, sun, moon, …)
    └── app/
        ├── app.component.ts    →  Root shell: navbar + <router-outlet> + toasts
        ├── app.config.ts       →  Providers: router, HttpClient, HTTP interceptor
        ├── app.routes.ts       →  Route table (lazy-loaded standalone components)
        │
        ├── core/               →  App-wide singletons (no UI) — the "engine"
        │   ├── models/         →  TypeScript interfaces + constants (Student, …)
        │   ├── services/       →  HttpClient data services (student, stats, toast)
        │   └── interceptors/   →  HTTP error normaliser
        │
        ├── features/           →  Page-level feature components (one folder per feature)
        │   ├── students/
        │   │   ├── student-list/   →  Table, search, filters, pagination, export, delete
        │   │   └── student-form/   →  Add / Edit reactive form
        │   └── settings/           →  Theme + about page
        │
        └── shared/             →  Reusable UI used across features
            └── components/     →  navbar, toast-container, not-found (404)
```

**Layering rule (frontend):** `features` and `shared` components depend on `core` services; `core` never depends on `features`. This keeps data access in one place and UI swappable.

### 3.3 Back-end (`server/`)

```
server/
├── server.js          →  Entry point: starts HTTP server, graceful shutdown
├── app.js             →  Express app factory: middleware order, routes, error handling
├── .env / .env.example→  Environment config (Supabase keys, port, CORS, rate limit)
├── package.json       →  Back-end dependencies + scripts (start/dev)
│
├── config/            →  Boot-time configuration
│   ├── env.js         →  Validates env vars with Zod (fail-fast)
│   └── supabase.js    →  Shared Supabase client (service-role key)
│
├── routes/            →  URL → handler mapping (the API surface)
│   ├── index.js       →  Mounts /students and /stats
│   ├── student.routes.js  →  CRUD routes + per-route validation
│   └── stats.routes.js    →  /overview
│
├── controllers/       →  Thin request handlers (parse req → call service → respond)
│   ├── student.controller.js
│   └── stats.controller.js
│
├── services/          →  Business logic + the ONLY layer that queries Supabase
│   └── student.service.js
│
├── middleware/        →  Cross-cutting request pipeline
│   ├── sanitize.middleware.js   →  Strip HTML/control chars, prototype-pollution defence
│   ├── validate.middleware.js   →  Zod validation + coercion
│   ├── error.middleware.js      →  Central error → JSON envelope
│   └── notFound.middleware.js   →  404 catch-all
│
├── validators/        →  Zod schemas (create/update/id/list) + FILIERES list
│   └── student.validator.js
│
└── utils/             →  Small reusable helpers
    ├── ApiError.js        →  Error class + status helpers
    ├── ApiResponse.js     →  sendSuccess() envelope
    └── asyncHandler.js    →  Async error forwarding
```

**Request flows downward, one layer at a time:**
`routes → controllers → services → Supabase`, with `middleware` wrapping the pipeline and `utils` shared by all. No layer skips ahead (a controller never queries the DB directly).

### 3.4 Database (`supabase/`)

```
supabase/
├── schema.sql   →  Table + indexes + trigger + RLS + stats RPC
├── seed.sql     →  24 sample students
└── setup.sql    →  schema + seed combined (one-paste setup)
```

---

## 4. Endpoints (quick list)

| Method | Path | Body / Query | Success | Controller → Service |
| --- | --- | --- | --- | --- |
| `GET` | `/api/health` | — | `200` | inline in `app.js` |
| `GET` | `/api/students` | query: search, filiere, ville, email, matricule, dateFrom, dateTo, sortBy, sortOrder, page, limit | `200` + `meta` | `getStudents` → `listStudents` |
| `GET` | `/api/students/:id` | — | `200` | `getStudent` → `getStudentById` |
| `POST` | `/api/students` | full student body | `201` | `createStudent` → `createStudent` |
| `PUT` | `/api/students/:id` | partial student body | `200` | `updateStudent` → `updateStudent` |
| `DELETE` | `/api/students/:id` | — | `200` | `deleteStudent` → `deleteStudent` |
| `GET` | `/api/stats/overview` | — | `200` | `getOverview` → `getStats` |

Full request/response shapes and validation rules: [API.md](API.md).

---

## 5. Back-end files (`server/`)

### Entry & configuration

**`server.js`** — Process entry point. Builds the app via `createApp()`, listens on `env.PORT`, logs the health URL, and installs `unhandledRejection` + `SIGTERM` handlers for a clean shutdown.

**`app.js`** — `createApp()` assembles the Express app and the middleware order: `helmet` → `cors` (restricted to `CLIENT_URL`) → `compression` → JSON/urlencoded body parsers (100 kb cap) → `morgan` → `sanitizeRequest` → rate limiter on `/api` → `GET /api/health` → API routes → `notFound` → `errorHandler`. `trust proxy` is set so client IPs are accurate behind a proxy.

**`config/env.js`** — Loads `.env` with dotenv, then validates every variable with a Zod schema (`PORT`, `CLIENT_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, rate-limit settings). Invalid/missing config prints a readable list and exits (fail-fast). Exports `env` and `isProd`.

**`config/supabase.js`** — Creates the single shared Supabase client using the **service-role key** (server-only). Exports `supabase` and `STUDENTS_TABLE = "students"`.

### Routing

**`routes/index.js`** — Root API router; mounts `/students` and `/stats`.

**`routes/student.routes.js`** — Maps the CRUD verbs and attaches `validate()` middleware per segment: list (`listQuerySchema` on query), create (`createStudentSchema` on body), get/delete (`idParamSchema` on params), update (`idParamSchema` + `updateStudentSchema`).

**`routes/stats.routes.js`** — `GET /overview` → `getOverview`.

### Controllers (thin request handlers)

**`controllers/student.controller.js`** — Five handlers (`getStudents`, `getStudent`, `createStudent`, `updateStudent`, `deleteStudent`). Each is wrapped in `asyncHandler`, calls the matching service function, and replies via `sendSuccess`. `createStudent` returns `201`.

**`controllers/stats.controller.js`** — `getOverview` → `studentService.getStats()` → `sendSuccess`.

### Service (business logic + data access)

**`services/student.service.js`** — The only file that talks to Supabase:
- `listStudents(query)` — builds a filtered/searched/sorted/paginated query, returns `{ data, meta }`. `sanitizeSearchTerm()` strips characters meaningful to PostgREST so search can't alter the query.
- `getStudentById(id)` — single row or `404`.
- `createStudent(payload)` / `updateStudent(id, payload)` / `deleteStudent(id)` — insert/update/delete, normalising empty `adresse` to `null`, `404` when a row is missing.
- `getStats()` — aggregates totals, "new this month / last 30 days", per-filière counts, a trailing 12-month trend, and the 5 most recent students.

### Middleware

**`middleware/sanitize.middleware.js`** — `sanitizeRequest` recursively trims strings, strips HTML tags + ASCII control chars, and drops prototype-polluting keys (`__proto__`, `prototype`, `constructor`) from body/query/params **before** validation.

**`middleware/validate.middleware.js`** — `validate(schema, source)` parses `req[source]` with Zod and replaces it with the clean, typed, defaulted value. Zod failures become a `422` `ApiError` with `{ field, message }` details.

**`middleware/error.middleware.js`** — Central error handler. Converts `ZodError` and Supabase/Postgres error codes (`23505`→409, `23502`→400, `22P02`→400, `PGRST116`→404) into `ApiError`s, then emits `{ success:false, message, errors? }`. Logs `5xx`; never leaks stack traces in production.

**`middleware/notFound.middleware.js`** — Catch-all that forwards a `404 ApiError` for unmatched routes.

### Utilities

**`utils/ApiError.js`** — `ApiError` class (status + message + optional details) with static helpers: `badRequest`, `notFound`, `conflict`, `unprocessable`, `internal`.

**`utils/ApiResponse.js`** — `sendSuccess(res, { statusCode, message, data, meta })` — the single success envelope used by every endpoint.

**`utils/asyncHandler.js`** — Wraps async handlers so rejected promises flow to the error middleware (no try/catch in controllers).

### Validation schema

**`validators/student.validator.js`** — Zod schemas and the `FILIERES` source of truth:
- `createStudentSchema` (`.strict()` — rejects unknown fields), `updateStudentSchema` (partial, ≥1 field), `idParamSchema` (UUID), `listQuerySchema` (whitelisted `sortBy`, coerced `page`/`limit`, defaults).

---

## 6. Front-end files (`frontend/src/`)

### Bootstrap & global

**`main.ts`** — Bootstraps the standalone `AppComponent` with `appConfig`.

**`index.html`** — Host page. Sets `<title>`, favicons, and an inline script that applies the saved theme (`.dark` class) **before paint** to avoid a flash.

**`styles.scss`** — Imports Bootstrap, the Inter font, defines light/dark CSS variables, dark-mode overrides for Bootstrap components (cards, tables, forms, dropdown options, pagination), and the `.app-icon` / `app-icon-sm` / `app-icon-lg` helpers for the image icons.

### App shell

**`app/app.component.ts`** — Root component. Inline template renders `<app-navbar>`, the routed page inside `.container-xl`, and `<app-toast-container>`. Subscribes to `ToastService.toasts$`.

**`app/app.config.ts`** — Providers: `provideRouter(routes)`, `provideHttpClient(withInterceptorsFromDi())`, and registers `ApiInterceptor`.

**`app/app.routes.ts`** — Routes, all **lazy-loaded** via `loadComponent`: `/students` (list), `/students/new` + `/students/:id/edit` (form), `/settings`, and `**` (404).

### Core (models, services, interceptor)

**`app/core/models/student.model.ts`** — TypeScript contracts: `Student`, `StudentQuery`, `PaginationMeta`, `ApiSuccess<T>`, `StudentStats`; constants `FILIERES`, `PAGE_SIZE_OPTIONS`, `SORTABLE_FIELDS`.

**`app/core/services/student.service.ts`** — All student API calls via `HttpClient`: `getStudents` (builds `HttpParams`, returns `{data, meta}`), `getStudent`, `createStudent`, `updateStudent`, `deleteStudent`, `getAllStudents`.

**`app/core/services/stats.service.ts`** — `getStats()` → `GET /api/stats/overview`.

**`app/core/services/toast.service.ts`** — In-memory toast store exposed as `toasts$`; `success/error/warning/info` helpers; auto-dismiss after 4 s.

**`app/core/interceptors/api.interceptor.ts`** — Catches `HttpErrorResponse` and normalises it to `{ message, status, fieldErrors }`; maps server `errors[]` onto fields and gives a friendly message when the backend is unreachable (`status 0`).

### Features

**`app/features/students/student-list/`** — The main page. `student-list.component.ts` holds filter state, debounces search (`debounceTime(350)`), loads students + stats, handles pagination, the delete-confirmation modal, the Angular-controlled Export dropdown, and the PDF/Excel exports (dynamic `import()` so the heavy libs load on demand). `.html` is the Bootstrap layout (stat cards, filters, table, states, pagination, modal).

**`app/features/students/student-form/`** — Shared Add/Edit form. `student-form.component.ts` builds a Reactive Form with `Validators`, loads the record in edit mode, submits create/update, and maps server field errors back onto controls. `.html` is the Bootstrap form with inline validation messages.

**`app/features/settings/settings.component.ts`** — Appearance (Light/Dark theme tiles, persisted to `localStorage`) and an About card.

### Shared components

**`app/shared/components/navbar/navbar.component.ts`** — Floating "pill" navbar: logo-less icon links (Students, Add, Settings) with `routerLinkActive`, tooltips, and a dark-mode toggle.

**`app/shared/components/toast-container/toast-container.component.ts`** — Renders the toast list as Bootstrap toasts (colour by type), bottom-right.

**`app/shared/components/not-found/not-found.component.ts`** — 404 page with a link back to the list.

---

## 7. Database (`supabase/`)

**`schema.sql`** — Creates the `students` table (UUID PK, `matricule`/`email` unique, check constraints), indexes (incl. trigram for fast search), an `updated_at` trigger, enables RLS (no public policies — access only via the trusted API), and an optional stats RPC. Full column list: [DATABASE.md](DATABASE.md).

**`seed.sql`** — Truncates and inserts 24 sample students with `created_at` spread over the past year (so the stats/trend have data).

**`setup.sql`** — `schema.sql` + `seed.sql` combined into a single paste-and-run script for a fresh project.

---

## 8. Security summary

- **Validation everywhere**: Zod on the server is authoritative; Angular forms give instant client feedback.
- **Sanitization**: every request is HTML/control-char stripped and protected against prototype pollution before it reaches a handler.
- **SQL injection**: only the Supabase SDK touches the DB (parameterised); search terms are stripped of filter-syntax characters.
- **Transport hardening**: Helmet headers, CORS limited to `CLIENT_URL`, rate limiting on `/api`, 100 kb body cap.
- **Secrets**: the service-role key lives only in `server/.env`; the browser only ever sees `/api`.
- **Errors**: standardised envelope; no stack traces in production.

Details and the validation rule table: [VALIDATION_SECURITY.md](VALIDATION_SECURITY.md).
