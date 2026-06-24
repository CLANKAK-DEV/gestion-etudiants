# Database Documentation

The application uses a single **Supabase (PostgreSQL)** table: `students`. The full DDL lives in [`supabase/schema.sql`](../supabase/schema.sql) and sample data in [`supabase/seed.sql`](../supabase/seed.sql).

## Tables

### `public.students`

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | `uuid` | PK, `default gen_random_uuid()` | Unique identifier |
| `matricule` | `text` | `not null`, `unique`, length 3–20 | Student registration number |
| `nom` | `text` | `not null` | Last name |
| `prenom` | `text` | `not null` | First name |
| `email` | `text` | `not null`, `unique`, must contain `@` | Email address |
| `telephone` | `text` | `not null` | Phone number |
| `date_naissance` | `date` | `not null`, must be in the past | Date of birth |
| `filiere` | `text` | `not null` | Academic program |
| `adresse` | `text` | nullable | Street address (optional) |
| `ville` | `text` | `not null` | City |
| `created_at` | `timestamptz` | `not null`, `default now()` | Creation timestamp |
| `updated_at` | `timestamptz` | `not null`, `default now()` | Last-update timestamp |

#### Check constraints
- `students_matricule_len` — `char_length(matricule) between 3 and 20`
- `students_email_format` — `position('@' in email) > 1`
- `students_dob_past` — `date_naissance < current_date`

These are lightweight integrity guards; the **full validation rules** are enforced by the API (see [VALIDATION_SECURITY.md](VALIDATION_SECURITY.md)).

## Relationships

This is a single-entity domain — there are **no foreign-key relationships**. `filiere` is stored as text and validated against a known list of programs at the application layer (the API rejects unknown values). This keeps the schema simple and the program list easy to evolve without migrations.

> The list of filières is the single source of truth in [`server/validators/student.validator.js`](../server/validators/student.validator.js) and mirrored on the client in [`src/utils/constants.ts`](../src/utils/constants.ts).

## Indexes

To keep filtering, sorting and search fast:

| Index | Column(s) | Purpose |
| --- | --- | --- |
| *(PK)* | `id` | Primary key lookups |
| *(unique)* | `matricule`, `email` | Uniqueness + fast equality |
| `idx_students_filiere` | `filiere` | Filter by program |
| `idx_students_ville` | `ville` | Filter by city |
| `idx_students_created_at` | `created_at desc` | Default sort + date range |
| `idx_students_nom_trgm` | `nom` (GIN trigram) | Fast `ILIKE` name search |
| `idx_students_prenom_trgm` | `prenom` (GIN trigram) | Fast `ILIKE` name search |
| `idx_students_email_trgm` | `email` (GIN trigram) | Fast `ILIKE` email search |

The trigram indexes require the `pg_trgm` extension, which the schema enables automatically.

## Triggers

### `trg_students_updated_at`
A `BEFORE UPDATE` trigger calls `public.set_updated_at()` to stamp `updated_at = now()` on every modification, so the column is always accurate regardless of how the row is changed.

```sql
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
```

## Row Level Security (RLS)

RLS is **enabled** on `students`, and **no public policies** are defined. This means the public/anon key cannot read or write the table directly from a browser. All access flows through the trusted Express API, which connects with the **service-role key** (which bypasses RLS). This is the appropriate model for a project with a trusted backend and no end-user authentication.

## Data structure (example row)

```json
{
  "id": "8f2a1c0e-3b4d-4e6a-9c2f-1a2b3c4d5e6f",
  "matricule": "STD-2024-001",
  "nom": "El Amrani",
  "prenom": "Yassine",
  "email": "yassine.elamrani@example.com",
  "telephone": "+212 661-234567",
  "date_naissance": "2003-04-12",
  "filiere": "Génie Informatique",
  "adresse": "12 Rue des Orangers",
  "ville": "Casablanca",
  "created_at": "2026-06-03T10:15:00.000Z",
  "updated_at": "2026-06-03T10:15:00.000Z"
}
```

## Optional: server-side aggregation

By default the student statistics are computed in Node from a slim projection (`filiere, created_at`). For very large datasets you can push aggregation into Postgres. The schema ships with an example function:

```sql
select * from public.student_stats_by_filiere();
-- → (filiere text, count bigint)
```

Call it from the service with `supabase.rpc('student_stats_by_filiere')` if you prefer database-side grouping.
