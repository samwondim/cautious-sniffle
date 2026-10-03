import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

/**
 * Lazy Postgres connection.
 *
 * `next build` evaluates every route module to collect page data, so whatever
 * this module does at import time has to hold in a build environment that has
 * no database secrets. Reading `DATABASE_URL` at module scope therefore broke
 * CI builds; Next's guidance is to read environment variables during dynamic
 * rendering, so the pool and its env check are deferred to the first query.
 * Every route that touches the database is `force-dynamic`, which makes that
 * first query part of a request and never part of the build.
 */

type Database = PostgresJsDatabase<typeof schema>;

/**
 * Next.js dev mode hot-reloads modules, which would leak a new pool on every
 * edit. Cache the client on `globalThis` so reloads reuse one connection.
 */
const globalForDb = globalThis as unknown as {
  __ehSqlClient?: ReturnType<typeof postgres>;
};

let client: ReturnType<typeof postgres> | undefined;
let database: Database | undefined;

function connect(): ReturnType<typeof postgres> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and run `npm run db:create`.",
    );
  }

  return postgres(connectionString, {
    max: process.env.NODE_ENV === "production" ? 10 : 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

/** The raw `postgres` pool. Opens the connection on first call. */
export function getSqlClient(): ReturnType<typeof postgres> {
  client ??= globalForDb.__ehSqlClient ?? connect();

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__ehSqlClient = client;
  }

  return client;
}

function getDatabase(): Database {
  database ??= drizzle(getSqlClient(), { schema });
  return database;
}

/**
 * The Drizzle client. A proxy, so that importing this module never connects:
 * the pool is built on the first property access, inside a request.
 */
export const db = new Proxy({} as Database, {
  get(_target, property) {
    const target = getDatabase() as unknown as Record<
      string | symbol,
      unknown
    >;
    const value = target[property];
    return typeof value === "function" ? value.bind(target) : value;
  },
  has(_target, property) {
    return property in (getDatabase() as object);
  },
});

export * from "./schema";
