import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and run `npm run db:create`.",
  );
}

/**
 * Next.js dev mode hot-reloads modules, which would leak a new pool on every
 * edit. Cache the client on `globalThis` so reloads reuse one connection.
 */
const globalForDb = globalThis as unknown as {
  __ehSqlClient?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.__ehSqlClient ??
  postgres(connectionString, {
    max: process.env.NODE_ENV === "production" ? 10 : 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__ehSqlClient = client;
}

export const db = drizzle(client, { schema });
export { client as sqlClient };
export * from "./schema";
