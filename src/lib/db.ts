import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");

let _db: InstanceType<typeof Database> | null = null;

export function getDb(): InstanceType<typeof Database> {
  if (_db) return _db;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  _db = new Database(path.join(DATA_DIR, "analytics.db"));
  _db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid       TEXT    NOT NULL,
      ts         INTEGER NOT NULL,
      event_type TEXT    NOT NULL,
      route      TEXT,
      extra      TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_events_ts   ON events(ts);
    CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);

    CREATE TABLE IF NOT EXISTS submissions (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid              TEXT    NOT NULL,
      ts                INTEGER NOT NULL,
      route             TEXT    NOT NULL,
      audience          TEXT,
      skills            TEXT,
      years_exp         TEXT,
      education         TEXT,
      city              TEXT,
      industry          TEXT,
      target_track      TEXT,
      target_role_id    TEXT,
      origin_profession TEXT,
      skills_count      INTEGER,
      report_hash       TEXT,
      duration_ms       INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_sub_ts    ON submissions(ts);
    CREATE INDEX IF NOT EXISTS idx_sub_route ON submissions(route);
  `);
  return _db;
}
