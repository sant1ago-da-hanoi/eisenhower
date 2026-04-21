import "server-only";

import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const DB_PATH = process.env.DATABASE_URL ?? "./data/app.db";

// Ensure the parent folder exists (e.g. ./data)
mkdirSync(dirname(DB_PATH), { recursive: true });

// Reuse the same instance across hot reloads in dev.
const globalForDb = globalThis as unknown as {
	__sqlite?: Database.Database;
};

const sqlite =
	globalForDb.__sqlite ??
	(() => {
		const connection = new Database(DB_PATH);
		connection.pragma("journal_mode = WAL");
		connection.pragma("foreign_keys = ON");
		return connection;
	})();

if (process.env.NODE_ENV !== "production") {
	globalForDb.__sqlite = sqlite;
}

export const db = drizzle(sqlite, { schema });
export { schema };
