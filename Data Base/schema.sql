-- SQLite schema for Artemis-Java
-- Run manually with:
--   sqlite3 "Artemis-Java/Data Base/assets.db" < Artemis-Java/src/main/resources/db/schema.sql

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  status TEXT,
  description TEXT,
  image_url TEXT,
  tags TEXT
);

CREATE TABLE IF NOT EXISTS asset_models (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS asset_model_assets (
  model_id TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  PRIMARY KEY (model_id, asset_id),
  FOREIGN KEY (model_id) REFERENCES asset_models(id) ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS missions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mission_assets (
  mission_id TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  PRIMARY KEY (mission_id, asset_id),
  FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS asset_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id TEXT NOT NULL,
  mission_id TEXT,
  timestamp TEXT,
  rpm INTEGER,
  steering_deg REAL,
  distance_m REAL,
  accel_m_s2 REAL,
  lateral_acc_m_s2 REAL,
  battery_pct REAL,
  distance_front_m REAL,
  event_code TEXT,
  manoeuvre TEXT,
  terrain_type TEXT,
  weather_condition TEXT,
  gps_lat REAL,
  gps_lon REAL,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE SET NULL
);

-- Helpful indexes for queries
CREATE INDEX IF NOT EXISTS idx_asset_logs_mission ON asset_logs(mission_id);
CREATE INDEX IF NOT EXISTS idx_asset_logs_asset ON asset_logs(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_logs_mission_asset ON asset_logs(mission_id, asset_id);

