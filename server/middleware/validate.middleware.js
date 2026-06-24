import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";

// Validates + coerces req[source] against a Zod schema, replacing it with the
// parsed value. Validation failures become a 422 ApiError with field details.
export function validate(schema, source = "body") {
  return (req, _res, next) => {
    try {
      const parsed = schema.parse(req[source]);

      // req.query / req.params can be read-only getters in Express 5-style
      // setups; assign field by field to stay compatible.
      if (source === "body") {
        req.body = parsed;
      } else {
        for (const key of Object.keys(req[source])) delete req[source][key];
        Object.assign(req[source], parsed);
      }

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.map((issue) => ({
          field: issue.path.join(".") || source,
          message: issue.message,
        }));
        return next(ApiError.unprocessable("Validation failed", details));
      }
      next(err);
    }
  };
}
