-- Database schema for ARES Fleet Management

CREATE TABLE assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT,
    manufacturer TEXT,
    serial_number TEXT,
    status TEXT
);

CREATE TABLE routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE route_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    route_id INTEGER NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    seq INTEGER NOT NULL,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    note TEXT
);

CREATE TABLE missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    route_id INTEGER REFERENCES routes(id),
    status TEXT DEFAULT 'planned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mission_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mission_id INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    seq INTEGER NOT NULL,
    kind TEXT NOT NULL,
    params TEXT
);

CREATE TABLE asset_routes (
    asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    route_id INTEGER NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    PRIMARY KEY (asset_id, route_id)
);


CREATE TABLE drive_data (
    idx INTEGER PRIMARY KEY,
    speed REAL,
    rpm REAL,
    steering REAL,
    distance REAL,
    accel REAL,
    lateral_acc REAL,
    battery REAL,
    distance_front REAL,
    event TEXT,
    manoeuvre TEXT,
    terrain_type TEXT,
    weather_condition TEXT,
    gps_lat REAL,
    gps_lon REAL
);

INSERT INTO drive_data (idx, speed, rpm, steering, distance, accel, lateral_acc, battery, distance_front, event, manoeuvre, terrain_type, weather_condition, gps_lat, gps_lon) VALUES
(0, 0, 800, 0, 0, 0, 0, 100, 10, 'start', 'idle', 'road', 'sunny', 48.0, 11.0),
(1, 5, 1000, 0.1, 5, 0.2, 0.05, 99, 9.5, '', 'drive', 'road', 'sunny', 48.0001, 11.0001),
(2, 10, 1100, 0.15, 10, 0.3, 0.07, 98, 9.0, '', 'drive', 'road', 'sunny', 48.0002, 11.0002);


CREATE VIEW view_asset_summary AS
SELECT a.id,
       a.name,
       COUNT(m.id) AS missions_count
FROM assets a
LEFT JOIN missions m ON m.asset_id = a.id
GROUP BY a.id;

CREATE VIEW view_route_usage AS
SELECT r.id,
       r.name,
       COUNT(m.id) AS missions_count
FROM routes r
LEFT JOIN missions m ON m.route_id = r.id
GROUP BY r.id;
