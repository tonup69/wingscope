import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@shared/schema";
import { sql } from "drizzle-orm";

const sqlite = new Database("data.db");
export const db = drizzle(sqlite, { schema });

// Initialize tables
db.run(sql`
  CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    image_data_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    error_message TEXT,
    predictions_json TEXT,
    morphology_json TEXT,
    summary_text TEXT,
    created_at INTEGER NOT NULL DEFAULT 0,
    batch_id TEXT
  )
`);
