import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(
    `\n🚀 Student Management API running in ${env.NODE_ENV} mode` +
      `\n   → http://localhost:${env.PORT}/api/health\n`,
  );
});

// Fail loudly on unexpected async errors rather than limping along.
process.on("unhandledRejection", (reason) => {
  // eslint-disable-next-line no-console
  console.error("Unhandled Rejection:", reason);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  // eslint-disable-next-line no-console
  console.log("SIGTERM received, shutting down gracefully.");
  server.close(() => process.exit(0));
});
