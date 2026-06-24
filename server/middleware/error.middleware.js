import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";
import { isProd } from "../config/env.js";

/**
 * Map a Supabase / PostgREST error to a friendly ApiError.
 * Codes reference: https://postgrest.org/en/stable/references/errors.html
 */
function mapSupabaseError(err) {
  switch (err.code) {
    case "23505": // unique_violation
      return ApiError.conflict(
        "A student with these details already exists (duplicate value).",
      );
    case "23502": // not_null_violation
      return ApiError.badRequest("A required field is missing.");
    case "22P02": // invalid_text_representation (e.g. bad UUID)
      return ApiError.badRequest("Invalid identifier format.");
    case "PGRST116": // no rows returned for single()
      return ApiError.notFound("Resource not found.");
    default:
      return null;
  }
}

// Central error handler → { success: false, message, errors? }.
// Never exposes stack traces or raw internals in production.
// eslint-disable-next-line no-unused-vars -- Express needs the 4-arg signature.
export function errorHandler(err, _req, res, _next) {
  let error = err;

  if (err instanceof ZodError) {
    error = ApiError.unprocessable(
      "Validation failed",
      err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    );
  } else if (err && err.code && typeof err.code === "string") {
    // Looks like a PostgREST/Postgres error object.
    error = mapSupabaseError(err) ?? error;
  }

  const isApiError = error instanceof ApiError;
  const statusCode = isApiError ? error.statusCode : 500;
  const message =
    isApiError || !isProd
      ? error.message || "Internal server error"
      : "Internal server error";

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error("[error]", err);
  }

  const body = { success: false, message };
  if (isApiError && error.details) body.errors = error.details;
  if (!isProd && !isApiError && err?.stack) body.stack = err.stack;

  res.status(statusCode).json(body);
}
