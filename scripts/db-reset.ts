/**
 * Drops and recreates the application database from scratch, then re-applies
 * migrations and seed data. Destructive: intended for local development only.
 *
 * Run `npm run db:reset` — it shells out to the other db:* scripts so there is
 * exactly one implementation of each step.
 */
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import postgres from "postgres";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

function run(script: string): void {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    shell: false,
  });
  if (result.status !== 0) {
    throw new Error(`\`npm run ${script}\` failed with exit code ${result.status}`);
  }
}

async function dropDatabase(): Promise<void> {
  const url = process.env.DATABASE_URL;
  const adminUrl = process.env.ADMIN_DATABASE_URL;
  if (!url || !adminUrl) {
    throw new Error("DATABASE_URL and ADMIN_DATABASE_URL must both be set.");
  }

  const dbName = decodeURIComponent(new URL(url).pathname.replace(/^\//, ""));
  const adminName = decodeURIComponent(
    new URL(adminUrl).pathname.replace(/^\//, ""),
  );
  if (!dbName || dbName === adminName) {
    throw new Error(`Refusing to drop unsafe database name "${dbName}".`);
  }

  const sql = postgres(adminUrl, { max: 1 });
  try {
    // Terminate stragglers so DROP DATABASE is not blocked by open connections.
    await sql`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = ${dbName} AND pid <> pg_backend_pid()
    `;
    await sql`DROP DATABASE IF EXISTS ${sql(dbName)}`;
    console.log(`Dropped database "${dbName}".`);
  } finally {
    await sql.end();
  }
}

async function main(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    throw new Error("db:reset refuses to run with NODE_ENV=production.");
  }

  await dropDatabase();
  run("db:create");
  run("db:migrate");
  run("db:seed");
  console.log("Reset complete.");
}

main().catch((error: unknown) => {
  console.error("Reset failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
