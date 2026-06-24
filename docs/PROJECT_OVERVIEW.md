# Project Overview

## Purpose

**EduManage** is a full-stack **Student Management System** designed to look and feel like a premium, modern SaaS admin dashboard. It provides a clean, fast and secure way to manage student records — without any authentication layer.

This project deliberately **excludes** login, registration, JWT, sessions, role systems and authentication pages. Every line of code serves the single goal of excellent student management.

## Features

- **Student CRUD** — create, read, update and delete student records with real-time UI updates.
- **Student statistics** — animated metric cards (total, new this month, last 30 days, active filières) embedded directly in the Students page.
- **Advanced search & filtering** — debounced multi-column search, filters by filière / city / date range, and multi-field sorting.
- **Export system** — generate branded PDF reports and styled Excel spreadsheets that honour the active filters.
- **Dark mode** — light / dark / system themes persisted to `localStorage`.
- **Validation & security** — Zod validation on client and server, request sanitization, rate limiting and hardened HTTP headers.
- **Notifications** — toast feedback and a confirmation modal before destructive actions.
- **Responsive UI** — built mobile-first with Bootstrap 5.

## Student data model

Each student record contains:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key, auto-generated |
| `matricule` | text | Unique student identifier |
| `nom` | text | Last name |
| `prenom` | text | First name |
| `email` | text | Unique, validated |
| `telephone` | text | Phone number |
| `date_naissance` | date | Date of birth |
| `filiere` | text | Academic program |
| `adresse` | text | Optional address |
| `ville` | text | City |
| `created_at` | timestamptz | Auto-set on insert |
| `updated_at` | timestamptz | Auto-maintained by a trigger |

## Technologies used

### Frontend
- **Angular 17 + TypeScript** — standalone-component SPA with route-level lazy loading.
- **Bootstrap 5** — responsive styling for the table, forms and layout.
- **RxJS** — reactive data streams for search, filters and HTTP.
- **HttpClient + HTTP interceptor** — typed API calls with a normalising error interceptor.
- **Angular Forms** — template-driven forms with field validation.
- **jsPDF / jspdf-autotable / xlsx** — export to PDF and Excel.
- **Toast service** — in-app success/error notifications.

### Backend
- **Node.js + Express (ESM)** — REST API.
- **Supabase JS SDK** — PostgreSQL access via parameterised queries.
- **Zod** — request validation.
- **Helmet, CORS, express-rate-limit, compression, Morgan** — security & platform middleware.

### Database
- **Supabase (PostgreSQL)** — managed Postgres with SQL schema, indexes and a trigger.

## Architecture

```
┌─────────────────────────────┐        HTTP /api        ┌──────────────────────────────┐
│        Angular SPA          │  ───────────────────▶   │        Express REST API        │
│                             │                         │                                │
│  components → services      │   HttpClient (normalised │  routes → controllers →        │
│  (HttpClient) → API         │   error envelope)        │  services → Supabase SDK       │
│                             │  ◀───────────────────    │                                │
│  Bootstrap 5 UI             │   { success, data, meta }│  middleware: sanitize,         │
│  RxJS + HTTP interceptor    │                         │  validate (Zod), rate-limit,   │
└─────────────────────────────┘                         │  helmet, error handler          │
                                                         └───────────────┬────────────────┘
                                                                         │ parameterised SQL
                                                                         ▼
                                                            ┌────────────────────────┐
                                                            │  Supabase (PostgreSQL)  │
                                                            │  students table + index │
                                                            └────────────────────────┘
```

**Key principles**

- **Layered backend** — each request flows through clearly separated stages, keeping handlers thin and logic testable.
- **Validation** — Zod schemas on the server are the source of truth; Angular forms add instant client-side feedback.
- **Centralised data access** — Angular services own all `HttpClient` calls; an HTTP interceptor normalises every failure into a consistent shape for toasts and form errors.
- **Standardised responses** — every endpoint returns a `{ success, data, meta }` envelope.
- **Performance by default** — route-level lazy loading and on-demand loading of heavy export libraries keep the initial payload small.
