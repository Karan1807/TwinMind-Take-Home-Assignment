import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  // This helps catch misconfiguration early on the server.
  throw new Error("DATABASE_URL env var is not set");
}

declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

export const pool =
  global.pgPool ??
  new Pool({
    connectionString,
    ssl:
      connectionString && connectionString.includes("supabase.co")
        ? { rejectUnauthorized: false }
        : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  global.pgPool = pool;
}


