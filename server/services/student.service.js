import { supabase, STUDENTS_TABLE } from "../config/supabase.js";
import { ApiError } from "../utils/ApiError.js";
import { FILIERES } from "../validators/student.validator.js";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Throw on a Supabase error, otherwise return the data. */
function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

// Strip characters meaningful to PostgREST's `or` syntax (, ()) and `ilike`
// patterns (% _ *) so a search term can't alter the query or inject wildcards.
function sanitizeSearchTerm(term) {
  return term
    .replace(/[%_*(),]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// List students with search, filters, sorting and pagination (+ meta).
export async function listStudents(query) {
  const {
    search,
    filiere,
    ville,
    email,
    matricule,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
    page,
    limit,
  } = query;

  let builder = supabase
    .from(STUDENTS_TABLE)
    .select("*", { count: "exact" });

  // Generic search across the most relevant text columns.
  const term = sanitizeSearchTerm(search ?? "");
  if (term) {
    builder = builder.or(
      [
        `nom.ilike.%${term}%`,
        `prenom.ilike.%${term}%`,
        `matricule.ilike.%${term}%`,
        `email.ilike.%${term}%`,
        `ville.ilike.%${term}%`,
      ].join(","),
    );
  }

  // Targeted filters.
  if (filiere && FILIERES.includes(filiere)) {
    builder = builder.eq("filiere", filiere);
  }
  if (ville) builder = builder.ilike("ville", `%${sanitizeSearchTerm(ville)}%`);
  if (email) builder = builder.ilike("email", `%${sanitizeSearchTerm(email)}%`);
  if (matricule) {
    builder = builder.ilike("matricule", `%${sanitizeSearchTerm(matricule)}%`);
  }

  // Inclusive date range on created_at.
  if (DATE_RE.test(dateFrom)) {
    builder = builder.gte("created_at", `${dateFrom}T00:00:00.000Z`);
  }
  if (DATE_RE.test(dateTo)) {
    builder = builder.lte("created_at", `${dateTo}T23:59:59.999Z`);
  }

  // Sorting + pagination.
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  builder = builder
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range(from, to);

  const { data, error, count } = await builder;
  if (error) throw error;

  const total = count ?? 0;
  return {
    data: data ?? [],
    meta: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getStudentById(id) {
  const student = unwrap(
    await supabase.from(STUDENTS_TABLE).select("*").eq("id", id).maybeSingle(),
  );
  if (!student) throw ApiError.notFound("Student not found");
  return student;
}

export async function createStudent(payload) {
  // Normalise empty optional strings to null for a clean DB record.
  const record = { ...payload, adresse: payload.adresse || null };
  return unwrap(
    await supabase.from(STUDENTS_TABLE).insert(record).select().single(),
  );
}

export async function updateStudent(id, payload) {
  const record = { ...payload, updated_at: new Date().toISOString() };
  if ("adresse" in record) record.adresse = record.adresse || null;

  const { data, error } = await supabase
    .from(STUDENTS_TABLE)
    .update(record)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw ApiError.notFound("Student not found");
  return data;
}

export async function deleteStudent(id) {
  const data = unwrap(
    await supabase.from(STUDENTS_TABLE).delete().eq("id", id).select(),
  );
  if (!data || data.length === 0) throw ApiError.notFound("Student not found");
  return data[0];
}

// Aggregate dashboard statistics in Node from a slim (filiere, created_at)
// projection. For very large datasets this could move into a Postgres RPC.
export async function getStats() {
  const rows = unwrap(
    await supabase.from(STUDENTS_TABLE).select("filiere, created_at"),
  );

  const total = rows.length;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Count by filière (initialise every known filière at 0 for stable charts).
  const byFiliereMap = Object.fromEntries(FILIERES.map((f) => [f, 0]));
  let newThisMonth = 0;
  let newLast30Days = 0;

  // Build the trailing 12-month buckets (YYYY-MM → count).
  const monthlyBuckets = [];
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyBuckets.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("en-US", { month: "short" }),
      year: d.getFullYear(),
      count: 0,
    });
  }
  const monthlyIndex = new Map(monthlyBuckets.map((b, idx) => [b.key, idx]));

  for (const row of rows) {
    if (row.filiere && row.filiere in byFiliereMap) {
      byFiliereMap[row.filiere] += 1;
    }
    if (!row.created_at) continue;
    const created = new Date(row.created_at);
    if (created >= startOfMonth) newThisMonth += 1;
    if (created >= thirtyDaysAgo) newLast30Days += 1;

    const key = `${created.getFullYear()}-${String(
      created.getMonth() + 1,
    ).padStart(2, "0")}`;
    if (monthlyIndex.has(key)) {
      monthlyBuckets[monthlyIndex.get(key)].count += 1;
    }
  }

  const byFiliere = Object.entries(byFiliereMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Most recent additions for the dashboard feed.
  const recent = unwrap(
    await supabase
      .from(STUDENTS_TABLE)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  );

  return {
    total,
    newThisMonth,
    newLast30Days,
    filiereCount: byFiliere.filter((f) => f.count > 0).length,
    byFiliere,
    monthly: monthlyBuckets,
    recent: recent ?? [],
  };
}
