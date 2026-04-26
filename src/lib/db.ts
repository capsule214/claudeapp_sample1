import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "memo.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      x REAL NOT NULL,
      y REAL NOT NULL,
      width REAL NOT NULL,
      height REAL NOT NULL,
      title TEXT NOT NULL,
      title_color TEXT NOT NULL,
      z_index INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS images (
      id TEXT PRIMARY KEY,
      x REAL NOT NULL,
      y REAL NOT NULL,
      width REAL NOT NULL,
      height REAL NOT NULL,
      z_index INTEGER NOT NULL,
      url TEXT NOT NULL DEFAULT '',
      mime_type TEXT NOT NULL DEFAULT '',
      data BLOB,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);

  // 既存テーブルへのカラム追加（初回のみ実行、以降は無視）
  for (const sql of [
    "ALTER TABLE images ADD COLUMN mime_type TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE images ADD COLUMN data BLOB",
  ]) {
    try { db.exec(sql); } catch { /* already exists */ }
  }
}
