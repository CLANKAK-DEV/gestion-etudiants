# API Reference

Base URL (development): `http://localhost:5000/api` — proxied from the frontend as `/api`.

All responses use a **standard envelope**.

**Success**
```json
{ "success": true, "message": "…", "data": <payload>, "meta": { … } }
```
`meta` is present only on list endpoints (pagination).

**Error**
```json
{ "success": false, "message": "…", "errors": [ { "field": "email", "message": "…" } ] }
```
`errors` is present only for validation failures (HTTP 422).

| Status | Meaning |
| --- | --- |
| `200` | OK |
| `201` | Created |
| `400` | Bad request (malformed id, etc.) |
| `404` | Not found |
| `409` | Conflict (duplicate `matricule` / `email`) |
| `422` | Validation failed |
| `429` | Rate limit exceeded |
| `500` | Server error |

---

## Health

### `GET /api/health`
```json
{
  "success": true,
  "message": "API is healthy",
  "data": { "uptime": 12.3, "timestamp": "2026-06-06T21:14:36.437Z" }
}
```

---

## Students

### `GET /api/students`
List students with search, filters, sorting and pagination.

**Query parameters** (all optional)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `search` | string | `""` | Matches `nom`, `prenom`, `matricule`, `email`, `ville` (case-insensitive, partial) |
| `filiere` | string | `""` | Exact program filter (must be a known filière) |
| `ville` | string | `""` | Partial city match |
| `email` | string | `""` | Partial email match |
| `matricule` | string | `""` | Partial matricule match |
| `dateFrom` | `YYYY-MM-DD` | `""` | Created on/after this date |
| `dateTo` | `YYYY-MM-DD` | `""` | Created on/before this date |
| `sortBy` | enum | `created_at` | One of `created_at, updated_at, nom, prenom, matricule, email, filiere, ville, date_naissance` |
| `sortOrder` | `asc`\|`desc` | `desc` | Sort direction |
| `page` | int ≥ 1 | `1` | Page number |
| `limit` | int 1–100 | `10` | Page size |

**Example**
```
GET /api/students?search=yassine&filiere=Génie%20Informatique&sortBy=nom&sortOrder=asc&page=1&limit=10
```

**Response `200`**
```json
{
  "success": true,
  "message": "Students retrieved",
  "data": [ { "id": "…", "matricule": "STD-2024-001", "nom": "El Amrani", … } ],
  "meta": { "total": 24, "page": 1, "limit": 10, "totalPages": 3 }
}
```

---

### `GET /api/students/:id`
Fetch a single student by UUID.

- `200` → `{ success, message, data: <student> }`
- `400` if `id` is not a valid UUID
- `404` if no student matches

---

### `POST /api/students`
Create a student.

**Request body**
```json
{
  "matricule": "STD-2024-025",
  "nom": "Dupont",
  "prenom": "Marie",
  "email": "marie.dupont@example.com",
  "telephone": "+33 6 12 34 56 78",
  "date_naissance": "2003-05-14",
  "filiere": "Génie Informatique",
  "adresse": "10 Rue de Paris",
  "ville": "Lyon"
}
```

- `201` → created student in `data`
- `422` validation failed (see rules below)
- `409` duplicate `matricule` or `email`

---

### `PUT /api/students/:id`
Update a student. Accepts a **partial** body (at least one field). `updated_at` is set automatically.

- `200` → updated student in `data`
- `400` invalid UUID · `404` not found · `409` duplicate · `422` validation failed

---

### `DELETE /api/students/:id`
Delete a student.

- `200` → `{ success, message: "Student deleted successfully", data: <deleted student> }`
- `400` invalid UUID · `404` not found

---

## Statistics

### `GET /api/stats/overview`
Aggregated metrics displayed in the Students page stat cards.

**Response `200`**
```json
{
  "success": true,
  "message": "Statistics retrieved",
  "data": {
    "total": 24,
    "newThisMonth": 2,
    "newLast30Days": 5,
    "filiereCount": 10,
    "byFiliere": [ { "name": "Génie Informatique", "count": 5 }, … ],
    "monthly": [ { "key": "2025-07", "label": "Jul", "year": 2025, "count": 1 }, … ],
    "recent": [ { "id": "…", "nom": "…", … } ]
  }
}
```

| Field | Description |
| --- | --- |
| `total` | Total number of students |
| `newThisMonth` | Created since the 1st of the current month |
| `newLast30Days` | Created in the last 30 days |
| `filiereCount` | Number of programs with ≥ 1 student |
| `byFiliere` | Count per program (all known filières, sorted desc) |
| `monthly` | Trailing 12-month buckets (for the trend chart) |
| `recent` | The 5 most recently created students |

---

## Validation rules

Enforced server-side by Zod ([`server/validators/student.validator.js`](../server/validators/student.validator.js)) and mirrored client-side for instant feedback.

| Field | Rule |
| --- | --- |
| `matricule` | Required · 3–20 chars · letters, digits, hyphens (`/^[A-Za-z0-9-]{3,20}$/`) |
| `nom`, `prenom` | Required · 2–50 chars · Unicode letters, spaces, `'`, `-` (accents allowed) |
| `email` | Required · valid email · ≤ 255 chars · lowercased |
| `telephone` | Required · `+`, digits, spaces, `()`, `.`, `-` · 6–20 chars |
| `date_naissance` | Required · `YYYY-MM-DD` · resulting age between 15 and 100 |
| `filiere` | Required · must be one of the known programs |
| `adresse` | Optional · ≤ 200 chars |
| `ville` | Required · 2–85 chars |

On `POST`, unknown fields are **rejected** (`.strict()`) to guard against mass assignment. On `PUT`, all fields are optional but at least one must be provided.

## Security headers & limits

- **Helmet** sets secure HTTP headers.
- **CORS** is restricted to `CLIENT_URL`.
- **Rate limiting**: `RATE_LIMIT_MAX` requests per `RATE_LIMIT_WINDOW_MINUTES` per IP (default 300 / 15 min) on `/api`.
- **Body size** is capped at `100kb`.
- All input is **sanitized** before validation (HTML/control-char stripping, prototype-pollution defence).

See [VALIDATION_SECURITY.md](VALIDATION_SECURITY.md) for details.
