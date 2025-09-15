package com.example.artemis.config;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class DatabaseInit {
    private final JdbcTemplate jdbc;

    public DatabaseInit(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @PostConstruct
    public void init() {
        jdbc.execute(
            "CREATE TABLE IF NOT EXISTS assets (" +
            " id TEXT PRIMARY KEY," +
            " name TEXT NOT NULL," +
            " category TEXT," +
            " status TEXT," +
            " description TEXT," +
            " image_url TEXT," +
            " tags TEXT" +
            ")"
        );
        jdbc.execute(
            "CREATE TABLE IF NOT EXISTS asset_models (" +
            " id TEXT PRIMARY KEY," +
            " name TEXT NOT NULL," +
            " description TEXT" +
            ")"
        );
        jdbc.execute(
            "CREATE TABLE IF NOT EXISTS asset_model_assets (" +
            " model_id TEXT NOT NULL," +
            " asset_id TEXT NOT NULL," +
            " PRIMARY KEY(model_id, asset_id)," +
            " FOREIGN KEY(model_id) REFERENCES asset_models(id) ON DELETE CASCADE," +
            " FOREIGN KEY(asset_id) REFERENCES assets(id) ON DELETE CASCADE" +
            ")"
        );

        // Missions and logs
        jdbc.execute(
            "CREATE TABLE IF NOT EXISTS missions (" +
            " id TEXT PRIMARY KEY," +
            " name TEXT NOT NULL" +
            ")"
        );
        jdbc.execute(
            "CREATE TABLE IF NOT EXISTS mission_assets (" +
            " mission_id TEXT NOT NULL," +
            " asset_id TEXT NOT NULL," +
            " PRIMARY KEY(mission_id, asset_id)," +
            " FOREIGN KEY(mission_id) REFERENCES missions(id) ON DELETE CASCADE," +
            " FOREIGN KEY(asset_id) REFERENCES assets(id) ON DELETE CASCADE" +
            ")"
        );
        jdbc.execute(
            "CREATE TABLE IF NOT EXISTS asset_logs (" +
            " id INTEGER PRIMARY KEY AUTOINCREMENT," +
            " asset_id TEXT NOT NULL," +
            " mission_id TEXT," +
            " timestamp TEXT," +
            " rpm INTEGER," +
            " steering_deg REAL," +
            " distance_m REAL," +
            " accel_m_s2 REAL," +
            " lateral_acc_m_s2 REAL," +
            " battery_pct REAL," +
            " distance_front_m REAL," +
            " event_code TEXT," +
            " manoeuvre TEXT," +
            " terrain_type TEXT," +
            " weather_condition TEXT," +
            " gps_lat REAL," +
            " gps_lon REAL," +
            " FOREIGN KEY(asset_id) REFERENCES assets(id) ON DELETE CASCADE," +
            " FOREIGN KEY(mission_id) REFERENCES missions(id) ON DELETE SET NULL" +
            ")"
        );
        // Seed one demo asset if table is empty
        jdbc.update(
            "INSERT INTO assets (id, name, category, status, description, image_url, tags) " +
            "SELECT lower(hex(randomblob(16))), 'Demo Asset', 'Sample', 'active', 'Beispiel-Datensatz', '', 'demo,sample' " +
            "WHERE NOT EXISTS (SELECT 1 FROM assets LIMIT 1)"
        );
    }
}
