import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

// Shared Supabase client. Uses the server-only service-role key (never sent to
// the browser). All queries go through the SDK, which parameterises them — the
// primary defence against SQL injection.
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: "public",
    },
  },
);

export const STUDENTS_TABLE = "students";
