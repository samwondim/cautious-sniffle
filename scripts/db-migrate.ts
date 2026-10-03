/**
 * Applies the versioned SQL migrations in `drizzle/` to the application
 * database. Non-interactive, so it works in CI and piped shells where
 * `drizzle-kit push` cannot prompt.
 */
import { existsSync } from "node:fs";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");

  const sql = postgres(url, { max: 1 });
  try {
    await migrate(drizzle(sql), { migrationsFolder: "./drizzle" });
    console.log("Migrations applied.");
  } finally {
    await sql.end();
  }
}

main().catch((error: unknown) => {
  console.error("Migration failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
