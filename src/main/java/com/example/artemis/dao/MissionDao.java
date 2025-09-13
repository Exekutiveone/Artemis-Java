package com.example.artemis.dao;

import com.example.artemis.db.Db;
import com.example.artemis.model.Mission;

import java.sql.*;
import java.util.*;

public class MissionDao {
    public List<Mission> findAll() {
        List<Mission> out = new ArrayList<>();
        String sql = "SELECT id, name, asset_id, route_id, status, created_at FROM missions ORDER BY created_at DESC";
        try (Connection c = Db.get();
             PreparedStatement ps = c.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Mission m = new Mission();
                m.id = rs.getInt("id");
                m.name = rs.getString("name");
                m.assetId = rs.getInt("asset_id");
                int routeId = rs.getInt("route_id");
                m.routeId = rs.wasNull() ? null : routeId;
                m.status = rs.getString("status");
                Timestamp ts = rs.getTimestamp("created_at");
                if (ts != null) m.createdAt = ts.toInstant();
                out.add(m);
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return out;
    }
}
