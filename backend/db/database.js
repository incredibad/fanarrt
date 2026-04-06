const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, 'fanart.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Initial schema (new installs only — migrations handle existing DBs) ────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS media_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('show', 'movie', 'anime')),
    title TEXT NOT NULL,
    year INTEGER,
    tvdb_id TEXT,
    tmdb_id TEXT,
    imdb_id TEXT,
    sonarr_id TEXT,
    radarr_id TEXT,
    poster_path TEXT,
    overview TEXT,
    status TEXT DEFAULT 'active',
    last_synced DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    fanart_fetched_at DATETIME
  );

  CREATE TABLE IF NOT EXISTS media_item_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_item_id INTEGER NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
    arr_type TEXT NOT NULL CHECK(arr_type IN ('sonarr', 'radarr')),
    instance_id TEXT NOT NULL,
    instance_label TEXT NOT NULL,
    external_id TEXT NOT NULL,
    assigned_type TEXT NOT NULL,
    UNIQUE(arr_type, instance_id, external_id)
  );

  CREATE TABLE IF NOT EXISTS fanart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_item_id INTEGER NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
    source TEXT NOT NULL CHECK(source IN ('tvdb', 'tmdb', 'fanart.tv', 'anilist')),
    source_id TEXT,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    width INTEGER,
    height INTEGER,
    language TEXT,
    likes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(media_item_id, source, url)
  );

  CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS favourites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    fanart_id INTEGER NOT NULL REFERENCES fanart(id) ON DELETE CASCADE,
    media_item_id INTEGER NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(collection_id, fanart_id)
  );

  CREATE INDEX IF NOT EXISTS idx_fanart_media ON fanart(media_item_id);
  CREATE INDEX IF NOT EXISTS idx_fanart_type ON fanart(type);
  CREATE INDEX IF NOT EXISTS idx_favourites_media ON favourites(media_item_id);
  CREATE INDEX IF NOT EXISTS idx_media_type ON media_items(type);
  CREATE INDEX IF NOT EXISTS idx_media_tvdb ON media_items(tvdb_id);
  CREATE INDEX IF NOT EXISTS idx_media_tmdb ON media_items(tmdb_id);
  CREATE INDEX IF NOT EXISTS idx_sources_media ON media_item_sources(media_item_id);
`);

// ── Migrations ─────────────────────────────────────────────────────────────────

// Collections + favourites migration (v1.2.0)
const favsTableSql = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='favourites'").get();
if (favsTableSql && !favsTableSql.sql.includes('collection_id')) {
  db.exec(`
    BEGIN;
    DROP TABLE favourites;
    CREATE TABLE favourites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
      fanart_id INTEGER NOT NULL REFERENCES fanart(id) ON DELETE CASCADE,
      media_item_id INTEGER NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(collection_id, fanart_id)
    );
    CREATE INDEX IF NOT EXISTS idx_favourites_media ON favourites(media_item_id);
    CREATE INDEX IF NOT EXISTS idx_favourites_collection ON favourites(collection_id);
    COMMIT;
  `);
  console.log('DB migration: favourites rebuilt with collection_id (existing favourites cleared)');
}

// Ensure at least one collection exists
const colCount = db.prepare('SELECT COUNT(*) as c FROM collections').get().c;
if (colCount === 0) {
  db.prepare("INSERT INTO collections(name) VALUES('My Favourites')").run();
  console.log('DB migration: default collection created');
}

// Add fanart_fetched_at column if it doesn't exist yet
try {
  db.exec(`ALTER TABLE media_items ADD COLUMN fanart_fetched_at DATETIME`);
} catch {}

// Add anilist_id column if it doesn't exist yet
try {
  db.exec(`ALTER TABLE media_items ADD COLUMN anilist_id INTEGER`);
} catch {}

// Fix the source CHECK constraint to include 'fanart.tv' and 'anilist'
const fanartTableSql = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='fanart'`).get();
if (fanartTableSql && (!fanartTableSql.sql.includes("'fanart.tv'") || !fanartTableSql.sql.includes("'anilist'"))) {
  db.exec(`
    BEGIN;
    CREATE TABLE fanart_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      media_item_id INTEGER NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
      source TEXT NOT NULL CHECK(source IN ('tvdb', 'tmdb', 'fanart.tv', 'anilist')),
      source_id TEXT,
      type TEXT NOT NULL,
      url TEXT NOT NULL,
      thumbnail_url TEXT,
      width INTEGER,
      height INTEGER,
      language TEXT,
      likes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(media_item_id, source, url)
    );
    INSERT OR IGNORE INTO fanart_new SELECT * FROM fanart;
    DROP TABLE fanart;
    ALTER TABLE fanart_new RENAME TO fanart;
    CREATE INDEX IF NOT EXISTS idx_fanart_media ON fanart(media_item_id);
    CREATE INDEX IF NOT EXISTS idx_fanart_type ON fanart(type);
    COMMIT;
  `);
  console.log('DB migration: fanart source constraint updated to include fanart.tv and anilist');
}

// Rebuild media_items to add 'anime' type and remove per-instance unique constraints (v1.5.0)
// Handles any combination of old-schema DBs in one pass.
const mediaTableSql = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='media_items'").get();
if (mediaTableSql && (!mediaTableSql.sql.includes("'anime'") || mediaTableSql.sql.includes('UNIQUE(type, sonarr_id)'))) {
  db.exec(`
    BEGIN;
    CREATE TABLE media_items_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('show', 'movie', 'anime')),
      title TEXT NOT NULL,
      year INTEGER,
      tvdb_id TEXT,
      tmdb_id TEXT,
      imdb_id TEXT,
      sonarr_id TEXT,
      radarr_id TEXT,
      poster_path TEXT,
      overview TEXT,
      status TEXT DEFAULT 'active',
      last_synced DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      fanart_fetched_at DATETIME
    );
    INSERT OR IGNORE INTO media_items_new SELECT * FROM media_items;
    DROP TABLE media_items;
    ALTER TABLE media_items_new RENAME TO media_items;
    CREATE INDEX IF NOT EXISTS idx_media_type ON media_items(type);
    CREATE INDEX IF NOT EXISTS idx_media_tvdb ON media_items(tvdb_id);
    CREATE INDEX IF NOT EXISTS idx_media_tmdb ON media_items(tmdb_id);
    COMMIT;
  `);
  console.log('DB migration: media_items updated for anime type and multi-instance support');
}

// Idempotent: add media_item_sources table if not present
db.exec(`
  CREATE TABLE IF NOT EXISTS media_item_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_item_id INTEGER NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
    arr_type TEXT NOT NULL CHECK(arr_type IN ('sonarr', 'radarr')),
    instance_id TEXT NOT NULL,
    instance_label TEXT NOT NULL,
    external_id TEXT NOT NULL,
    assigned_type TEXT NOT NULL,
    UNIQUE(arr_type, instance_id, external_id)
  );
  CREATE INDEX IF NOT EXISTS idx_sources_media ON media_item_sources(media_item_id);
`);

module.exports = db;
