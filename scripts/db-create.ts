/**
 * Idempotently creates the application database on the local PostgreSQL
 * server. Connects to `ADMIN_DATABASE_URL` because `CREATE DATABASE` cannot
 * run from inside the database being created.
 */
import { existsSync } from "node:fs";
import postgres from "postgres";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const TARGET_URL =
  process.env.DATABASE_URL ??
  "postgresql://prom2@localhost:5432/empower_humanity";
const ADMIN_URL =
  process.env.ADMIN_DATABASE_URL ?? "postgresql://prom2@localhost:5432/postgres";

/** `.../empower_humanity` -> `empower_humanity`, honoring percent-encoding. */
function databaseName(url: string): string {
  const name = new URL(url).pathname.replace(/^\//, "");
  if (!name) throw new Error(`No database name in URL: ${url}`);
  return decodeURIComponent(name);
}

async function main(): Promise<void> {
  const dbName = databaseName(TARGET_URL);
  const adminName = databaseName(ADMIN_URL);

  if (dbName === adminName) {
    throw new Error(
      `Refusing to create database "${dbName}": it is the same database that ` +
        `ADMIN_DATABASE_URL points at. Set a distinct DATABASE_URL.`,
    );
  }

  const sql = postgres(ADMIN_URL, { max: 1 });

  try {
    // postgres.js resolves to the row array itself (no `.rows` wrapper).
    const existing = await sql<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM pg_database WHERE datname = ${dbName}
      ) AS exists
    `;

    if (existing[0]?.exists) {
      console.log(`Database "${dbName}" already exists — nothing to do.`);
    } else {
      // `sql(name)` builds a safely quoted identifier, unlike interpolation.
      await sql`CREATE DATABASE ${sql(dbName)}`;
      console.log(`Created database "${dbName}".`);
    }

    // Reachability check against the target database itself.
    const target = postgres(TARGET_URL, { max: 1 });
    try {
      const [row] = await target<{ version: string }[]>`SELECT version()`;
      const short = row?.version.split(" ").slice(0, 2).join(" ") ?? "unknown";
      console.log(`Connected to "${dbName}" — ${short}`);
    } finally {
      await target.end();
    }
  } finally {
    await sql.end();
  }
}

main().catch((error: unknown) => {
  console.error("Failed to provision the application database.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
