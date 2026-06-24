import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { env, isProd } from "./config/env.js";
import apiRoutes from "./routes/index.js";
import { sanitizeRequest } from "./middleware/sanitize.middleware.js";
import { notFound } from "./middleware/notFound.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

export function createApp() {
  const app = express();

  // Trust the first proxy hop (needed for correct client IPs behind a proxy,
  // which keeps rate limiting accurate in production).
  app.set("trust proxy", 1);

  // ── Security & platform middleware ──────────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_URL,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: false,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: "100kb" })); // small payloads only
  app.use(express.urlencoded({ extended: true, limit: "100kb" }));
  app.use(morgan(isProd ? "combined" : "dev"));

  // Sanitise every incoming request before it reaches validation/handlers.
  app.use(sanitizeRequest);

  // Rate limiting (per IP)
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests, please try again later.",
    },
  });
  app.use("/api", limiter);

  //  Health check 
  app.get("/api/health", (_req, res) => {
    res.json({
      success: true,
      message: "API is healthy",
      data: { uptime: process.uptime(), timestamp: new Date().toISOString() },
    });
  });

  //  API routes
  app.use("/api", apiRoutes);

  // 404 + centralised error handling (must be last)
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
