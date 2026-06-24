import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

// Validate + normalise env vars at boot, so the server fails fast (rather than
// starting half-configured) if anything required is missing or malformed.
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  CLIENT_URL: z.string().url().default("http://localhost:4200"),
  SUPABASE_URL: z
    .string()
    .url({ message: "SUPABASE_URL must be a valid URL" }),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, { message: "SUPABASE_SERVICE_ROLE_KEY is required" }),
  RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().positive().default(15),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Pretty-print the configuration problems and exit.
  const issues = parsed.error.issues
    .map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  // eslint-disable-next-line no-console
  console.error(
    `\n✖ Invalid environment configuration:\n${issues}\n\n` +
      `Copy server/.env.example to server/.env and fill in the values.\n`,
  );
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
