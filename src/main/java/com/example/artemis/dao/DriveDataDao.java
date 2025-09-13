package com.example.artemis.dao;

import com.example.artemis.db.Db;

import java.sql.*;
import java.util.*;

public class DriveDataDao {
    public Map<String, Object> findAll() {
        String sql = "SELECT * FROM drive_data ORDER BY idx";
        List<Integer> idx = new ArrayList<>();
        List<Double> speed = new ArrayList<>();
        List<Double> rpm = new ArrayList<>();
        List<Double> steering = new ArrayList<>();
        List<Double> distance = new ArrayList<>();
        List<Double> accel = new ArrayList<>();
        List<Double> lateralAcc = new ArrayList<>();
        List<Double> battery = new ArrayList<>();
        List<Double> distanceFront = new ArrayList<>();
        List<String> event = new ArrayList<>();
        List<String> manoeuvre = new ArrayList<>();
        List<String> terrain = new ArrayList<>();
        List<String> weather = new ArrayList<>();
        List<Double> gpsLat = new ArrayList<>();
        List<Double> gpsLon = new ArrayList<>();
        try (Connection c = Db.get();
             PreparedStatement ps = c.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                idx.add(rs.getInt("idx"));
                speed.add(rs.getDouble("speed"));
                rpm.add(rs.getDouble("rpm"));
                steering.add(rs.getDouble("steering"));
                distance.add(rs.getDouble("distance"));
                accel.add(rs.getDouble("accel"));
                lateralAcc.add(rs.getDouble("lateral_acc"));
                battery.add(rs.getDouble("battery"));
                distanceFront.add(rs.getDouble("distance_front"));
                event.add(rs.getString("event"));
                manoeuvre.add(rs.getString("manoeuvre"));
                terrain.add(rs.getString("terrain_type"));
                weather.add(rs.getString("weather_condition"));
                gpsLat.add(rs.getDouble("gps_lat"));
                gpsLon.add(rs.getDouble("gps_lon"));
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        Map<String, Object> series = new HashMap<>();
        series.put("speed", speed);
        series.put("rpm", rpm);
        series.put("steering", steering);
        series.put("distance", distance);
        series.put("accel", accel);
        series.put("lateral_acc", lateralAcc);
        series.put("battery", battery);
        series.put("distance_front", distanceFront);
        series.put("event", event);
        series.put("manoeuvre", manoeuvre);
        series.put("terrain_type", terrain);
        series.put("weather_condition", weather);
        series.put("gps_lat", gpsLat);
        series.put("gps_lon", gpsLon);
        Map<String, Object> result = new HashMap<>();
        result.put("idx", idx);
        result.put("series", series);
        return result;
    }
}
