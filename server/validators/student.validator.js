import { z } from "zod";

/**
 * The set of academic programs (filières) a student can belong to.
 * Kept here as the single source of truth on the backend; the frontend keeps
 * a mirrored list in src/utils/constants.ts.
 */
export const FILIERES = [
  "Génie Informatique",
  "Génie Civil",
  "Génie Électrique",
  "Génie Mécanique",
  "Génie Industriel",
  "Réseaux & Télécoms",
  "Sciences Économiques",
  "Gestion & Management",
  "Mathématiques Appliquées",
  "Biologie",
];

// ── Reusable field-level rules ────────────────────────────────────────────
// Allow Unicode letters so accented French names validate correctly.
const NAME_RE = /^[\p{L}][\p{L}\s'-]*$/u;
const PHONE_RE = /^[+]?[\d\s().-]{6,20}$/;
const MATRICULE_RE = /^[A-Za-z0-9-]{3,20}$/;

const name = (label) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(2, `${label} must be at least 2 characters`)
    .max(50, `${label} must be at most 50 characters`)
    .regex(NAME_RE, `${label} contains invalid characters`);

const dateNaissance = z
  .string({ required_error: "Date of birth is required" })
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format")
  .refine((val) => !Number.isNaN(Date.parse(val)), "Invalid date")
  .refine((val) => {
    const dob = new Date(val);
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
    return age >= 15 && age <= 100;
  }, "Student age must be between 15 and 100 years");

// Create 
export const createStudentSchema = z
  .object({
    matricule: z
      .string({ required_error: "Matricule is required" })
      .trim()
      .regex(
        MATRICULE_RE,
        "Matricule must be 3-20 characters (letters, digits, hyphens)",
      ),
    nom: name("Last name"),
    prenom: name("First name"),
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Please enter a valid email address")
      .max(255, "Email is too long"),
    telephone: z
      .string({ required_error: "Phone number is required" })
      .trim()
      .regex(PHONE_RE, "Please enter a valid phone number"),
    date_naissance: dateNaissance,
    filiere: z.enum([...FILIERES], {
      errorMap: () => ({ message: "Please select a valid filière" }),
    }),
    adresse: z
      .string()
      .trim()
      .max(200, "Address is too long")
      .optional()
      .or(z.literal("")),
    ville: z
      .string({ required_error: "City is required" })
      .trim()
      .min(2, "City must be at least 2 characters")
      .max(85, "City is too long"),
  })
  .strict(); // reject unknown keys → extra protection against mass assignment

// ── Update (all fields optional, but at least one required) ─────────────────
export const updateStudentSchema = createStudentSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

// ── Route param ─────────────────────────────────────────────────────────────
export const idParamSchema = z.object({
  id: z.string().uuid("Invalid student id"),
});

// ── List query (filters, search, sorting, pagination) ───────────────────────
const SORTABLE_COLUMNS = [
  "created_at",
  "updated_at",
  "nom",
  "prenom",
  "matricule",
  "email",
  "filiere",
  "ville",
  "date_naissance",
];

export const listQuerySchema = z.object({
  // Generic full-text-ish search across nom/prenom/matricule/email/ville.
  search: z.string().trim().max(100).optional().default(""),
  // Targeted filters.
  filiere: z.string().trim().optional().default(""),
  ville: z.string().trim().optional().default(""),
  email: z.string().trim().optional().default(""),
  matricule: z.string().trim().optional().default(""),
  // Date range on created_at (YYYY-MM-DD), inclusive.
  dateFrom: z.string().trim().optional().default(""),
  dateTo: z.string().trim().optional().default(""),
  // Sorting.
  sortBy: z.enum([...SORTABLE_COLUMNS]).optional().default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  // Pagination.
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});
