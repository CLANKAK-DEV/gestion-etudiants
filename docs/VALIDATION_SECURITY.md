# Validation & Security Documentation

Although the project has **no authentication**, it treats data integrity and input safety as first-class concerns. Validation happens on **both** the client (fast feedback) and the server (the source of truth), and every request is sanitized and rate-limited.

## Frontend validation

- **Angular Reactive Forms** with built-in `Validators`. The form is defined in [`student-form.component.ts`](../frontend/src/app/features/students/student-form/student-form.component.ts).
- Validation feedback shows once a field is `dirty` or `touched`, so users see **inline, field-level messages** as they go.
- The same constraints as the backend are encoded here, so most errors are caught before a request is ever sent.
- If the backend returns field errors anyway (the authoritative check), they are mapped back onto the matching controls via `control.setErrors({ server: msg })`, so server-side failures also appear next to the right field.

**Rules**

| Field | Rule |
| --- | --- |
| `matricule` | required · 3–20 chars · letters/digits/hyphens |
| `nom`, `prenom` | required · 2–50 chars · Unicode letters, spaces, `'`, `-` |
| `email` | required · valid email · ≤ 255 |
| `telephone` | required · `+`, digits, spaces, `()`, `.`, `-` · 6–20 |
| `date_naissance` | required · valid date · age 15–100 |
| `filiere` | required · one of the known programs |
| `adresse` | optional · ≤ 200 |
| `ville` | required · 2–85 |

## Backend validation

- **Zod** schemas in [`server/validators/student.validator.js`](../server/validators/student.validator.js) validate the body, route params and query string.
- A reusable [`validate(schema, source)`](../server/middleware/validate.middleware.js) middleware parses and **coerces** input (e.g. `page`/`limit` strings → numbers, email → lowercased), replacing the raw input with clean, typed data before the controller runs.
- Failures produce a structured **HTTP 422** with `errors: [{ field, message }]`.
- **Mass-assignment protection**: the create schema is `.strict()`, rejecting any unknown fields. Updates require at least one field.
- **Whitelisted sorting**: `sortBy` is an enum of indexed columns; anything else is rejected.

```js
router
  .route("/")
  .get(validate(listQuerySchema, "query"), controller.getStudents)
  .post(validate(createStudentSchema, "body"), controller.createStudent);
```

## Sanitization (XSS defence)

Every incoming request passes through [`sanitizeRequest`](../server/middleware/sanitize.middleware.js) **before** validation. It recursively walks the body, query and params and:

- **strips HTML tags** from strings (student data is plain text — this neutralises stored-XSS payloads),
- **removes ASCII control characters**,
- **trims** whitespace,
- **drops prototype-polluting keys** (`__proto__`, `prototype`, `constructor`).

Because data is cleaned on the way in and rendered as plain text by Angular's interpolation (`{{ }}`, which escapes by default), stored/reflected XSS is mitigated end-to-end.

## SQL injection prevention

All database access goes through the **Supabase JS SDK**, which builds **parameterised** requests — user input is never concatenated into SQL. In addition, the search term is stripped of characters meaningful to PostgREST's filter syntax, so it can't alter query structure. There is no raw SQL string-building anywhere in the request path.

## Transport & platform hardening

Configured in [`server/app.js`](../server/app.js):

| Protection | Detail |
| --- | --- |
| **Helmet** | Secure HTTP headers (CSP-friendly defaults, no `X-Powered-By`, etc.) |
| **CORS** | Restricted to `CLIENT_URL`; only `GET/POST/PUT/DELETE/OPTIONS` |
| **Rate limiting** | `express-rate-limit` — default 300 req / 15 min per IP on `/api` |
| **Body limits** | JSON/urlencoded capped at `100kb` |
| **trust proxy** | Set so client IPs (and thus rate limits) are accurate behind a proxy |
| **Compression** | gzip responses |
| **Logging** | Morgan (`dev` locally, `combined` in production) |

## Error handling

- Controllers are wrapped in [`asyncHandler`](../server/utils/asyncHandler.js) so rejected promises flow to the central handler — no unhandled crashes, no hanging requests.
- The central [`errorHandler`](../server/middleware/error.middleware.js):
  - normalises `ApiError`, `ZodError` and **Supabase/Postgres errors** (e.g. `23505` unique-violation → **409 Conflict**, missing row → **404**),
  - returns the standard `{ success: false, message, errors? }` envelope,
  - **never leaks stack traces in production** (they're only included in development),
  - logs `5xx` errors server-side.
- Config is validated at boot ([`server/config/env.js`](../server/config/env.js)); the server **fails fast** with a readable message rather than starting in an insecure, half-configured state.

## Safe API responses

A single success envelope ([`sendSuccess`](../server/utils/ApiResponse.js)) and a single error envelope keep responses predictable. The frontend's HTTP interceptor ([`api.interceptor.ts`](../frontend/src/app/core/interceptors/api.interceptor.ts)) normalises every failure into `{ message, status, fieldErrors }`, so UI code (toasts, form errors) never has to parse raw HTTP internals.

## Secure coding practices summary

- Validate on both ends; treat the server as authoritative.
- Sanitize all input; render as plain text.
- Parameterised queries only; no string-built SQL.
- Least exposure: the service-role key stays server-side; the frontend only ever sees `/api`.
- Fail fast on misconfiguration; fail safe on errors (no leaks).
- Predictable, typed contracts between client and server.
