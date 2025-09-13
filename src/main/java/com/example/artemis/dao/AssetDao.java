package com.example.artemis.dao;

import com.example.artemis.db.Db;
import com.example.artemis.model.Asset;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/** Data access object for {@link Asset} records. */
public class AssetDao {

    /** Returns all assets ordered by name. */
    public List<Asset> findAll() {
        List<Asset> out = new ArrayList<>();
        String sql = "SELECT * FROM assets ORDER BY name";
        try (Connection c = Db.get();
             PreparedStatement ps = c.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Asset a = new Asset();
                a.id = rs.getInt("id");
                a.name = rs.getString("name");
                a.type = rs.getString("type");
                a.manufacturer = rs.getString("manufacturer");
                a.serialNumber = rs.getString("serial_number");
                a.status = rs.getString("status");
                out.add(a);
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return out;
    }

    /** Inserts the asset and returns it with its generated id. */
    public Asset insert(Asset a) {
        String sql = "INSERT INTO assets(name,type,manufacturer,serial_number,status) VALUES(?,?,?,?,?)";
        try (Connection c = Db.get();
             PreparedStatement ps = c.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, a.name);
            ps.setString(2, a.type);
            ps.setString(3, a.manufacturer);
            ps.setString(4, a.serialNumber);
            ps.setString(5, a.status == null ? "active" : a.status);
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) a.id = keys.getInt(1);
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return a;
    }
}
