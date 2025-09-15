package com.example.artemis.dao;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Map;

@Repository
public class AssetLogDao {
    private final JdbcTemplate jdbc;
    public AssetLogDao(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public void insertRow(String assetId, String missionId, Map<String, String> row) {
        jdbc.update(
            "INSERT INTO asset_logs (asset_id, mission_id, timestamp, rpm, steering_deg, distance_m, accel_m_s2, lateral_acc_m_s2, battery_pct, distance_front_m, event_code, manoeuvre, terrain_type, weather_condition, gps_lat, gps_lon) " +
            "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            assetId,
            missionId,
            row.getOrDefault("timestamp", null),
            parseInt(row.get("rpm")),
            parseDouble(row.get("steering_deg")),
            parseDouble(row.get("distance_m")),
            parseDouble(row.get("accel_m_s2")),
            parseDouble(row.get("lateral_acc_m_s2")),
            parseDouble(row.get("battery_pct")),
            parseDouble(row.get("distance_front_m")),
            row.getOrDefault("event_code", null),
            row.getOrDefault("manoeuvre", null),
            row.getOrDefault("terrain_type", null),
            row.getOrDefault("weather_condition", null),
            parseDouble(row.get("gps_lat")),
            parseDouble(row.get("gps_lon"))
        );
    }

    private Integer parseInt(String s) {
        try { return s == null || s.isEmpty() ? null : Integer.parseInt(s); } catch (Exception e) { return null; }
    }
    private Double parseDouble(String s) {
        try { return s == null || s.isEmpty() ? null : Double.parseDouble(s); } catch (Exception e) { return null; }
    }

    public int deleteByMission(String missionId) {
        return jdbc.update("DELETE FROM asset_logs WHERE mission_id = ?", missionId);
    }

    public int deleteByMissionAndAsset(String missionId, String assetId) {
        return jdbc.update("DELETE FROM asset_logs WHERE mission_id = ? AND asset_id = ?", missionId, assetId);
    }

    public int deleteByAsset(String assetId) {
        return jdbc.update("DELETE FROM asset_logs WHERE asset_id = ?", assetId);
    }
}
