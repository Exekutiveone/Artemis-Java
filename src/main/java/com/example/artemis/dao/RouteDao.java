package com.example.artemis.dao;

import com.example.artemis.db.Db;
import com.example.artemis.model.Route;

import java.sql.*;
import java.util.*;

public class RouteDao {
    public List<Route> findAll() {
        List<Route> out = new ArrayList<>();
        String sql = "SELECT id, name FROM routes ORDER BY name";
        try (Connection c = Db.get();
             PreparedStatement ps = c.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Route r = new Route();
                r.id = rs.getInt("id");
                r.name = rs.getString("name");
                out.add(r);
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return out;
    }
}
