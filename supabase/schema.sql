-- ============================================================================
--  Student Management System — Database schema
--  Target: Supabase (PostgreSQL)
--
--  How to apply:
--    1. Open your Supabase project → SQL Editor.
--    2. Paste this file and click "Run".
--    3. (Optional) Run supabase/seed.sql to load sample data.
-- ============================================================================

-- Extensions ----------------------------------------------------------------
-- pgcrypto provides gen_random_uuid(); pg_trgm powers fast ILIKE/search.
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- Table ---------------------------------------------------------------------
create table if not exists public.students (
    id             uuid primary key default gen_random_uuid(),
    matricule      text        not null unique,
    nom            text        not null,
    prenom         text        not null,
    email          text        not null unique,
    telephone      text        not null,
    date_naissance date        not null,
    filiere        text        not null,
    adresse        text,
    ville          text        not null,
    created_at     timestamptz not null default now(),
    updated_at     timestamptz not null default now(),

    -- Lightweight integrity guards (the API enforces the full rules).
    constraint students_matricule_len check (char_length(matricule) between 3 and 20),
    constraint students_email_format  check (position('@' in email) > 1),
    constraint students_dob_past      check (date_naissance < current_date)
);

comment on table public.students is 'Student records for the Student Management System.';

-- Indexes -------------------------------------------------------------------
-- Filters used by the dashboard / table view.
create index if not exists idx_students_filiere    on public.students (filiere);
create index if not exists idx_students_ville       on public.students (ville);
create index if not exists idx_students_created_at  on public.students (created_at desc);

-- Trigram indexes for fast case-insensitive partial search.
create index if not exists idx_students_nom_trgm    on public.students using gin (nom gin_trgm_ops);
create index if not exists idx_students_prenom_trgm on public.students using gin (prenom gin_trgm_ops);
create index if not exists idx_students_email_trgm  on public.students using gin (email gin_trgm_ops);

-- Auto-maintain updated_at --------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trg_students_updated_at on public.students;
create trigger trg_students_updated_at
    before update on public.students
    for each row
    execute function public.set_updated_at();

-- Row Level Security --------------------------------------------------------
-- The backend connects with the SERVICE ROLE key, which bypasses RLS.
-- We still enable RLS so that the public/anon key cannot read or write the
-- table directly from the browser. No public policies are added on purpose:
-- all access must go through the trusted Express API.
alter table public.students enable row level security;

-- ============================================================================
--  OPTIONAL — server-side stats aggregation (RPC)
--  The API computes stats in Node by default. If you prefer to push the
--  aggregation into Postgres for very large datasets, create this function
--  and call it via supabase.rpc('student_stats_by_filiere').
-- ============================================================================
create or replace function public.student_stats_by_filiere()
returns table (filiere text, count bigint)
language sql
stable
as $$
    select filiere, count(*)::bigint as count
    from public.students
    group by filiere
    order by count desc;
$$;
