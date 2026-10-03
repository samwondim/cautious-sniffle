import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://prom2@localhost:5432/empower_humanity",
  },
  strict: true,
  verbose: true,
});
