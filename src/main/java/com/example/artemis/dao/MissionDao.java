package com.example.artemis.dao;

import com.example.artemis.model.Mission;
import com.example.artemis.model.Asset;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public class MissionDao {
    private final JdbcTemplate jdbc;
    public MissionDao(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public List<Mission> findAll() {
        return jdbc.query("SELECT * FROM missions ORDER BY name",
                (rs,i)->{ Mission m = new Mission(); m.setId(rs.getString("id")); m.setName(rs.getString("name")); return m;});
    }

    public Mission findById(String id) {
        try {
            return jdbc.queryForObject("SELECT * FROM missions WHERE id=?",
                    (rs,i)->{ Mission m = new Mission(); m.setId(rs.getString("id")); m.setName(rs.getString("name")); return m;}, id);
        } catch (EmptyResultDataAccessException e) { return null; }
    }

    public Mission insert(Mission m) {
        if (m.getId()==null || m.getId().isEmpty()) m.setId(UUID.randomUUID().toString());
        jdbc.update("INSERT INTO missions (id,name) VALUES (?,?)", m.getId(), m.getName());
        return m;
    }

    public int delete(String id) {
        return jdbc.update("DELETE FROM missions WHERE id=?", id);
    }

    public List<Mission> missionsForAsset(String assetId) {
        return jdbc.query("SELECT m.* FROM missions m JOIN mission_assets ma ON m.id = ma.mission_id WHERE ma.asset_id=? ORDER BY m.name",
                (rs,i)->{ Mission m = new Mission(); m.setId(rs.getString("id")); m.setName(rs.getString("name")); return m; }, assetId);
    }

    public void assign(String missionId, String assetId) {
        jdbc.update("INSERT OR IGNORE INTO mission_assets (mission_id, asset_id) VALUES (?,?)", missionId, assetId);
    }

    public void unassign(String missionId, String assetId) {
        jdbc.update("DELETE FROM mission_assets WHERE mission_id=? AND asset_id=?", missionId, assetId);
    }

    public List<Asset> assetsForMission(String missionId) {
        return jdbc.query(
            "SELECT a.* FROM assets a JOIN mission_assets ma ON a.id = ma.asset_id WHERE ma.mission_id = ? ORDER BY a.name",
            (rs, i) -> {
                Asset a = new Asset();
                a.setId(rs.getString("id"));
                a.setName(rs.getString("name"));
                a.setCategory(rs.getString("category"));
                a.setStatus(rs.getString("status"));
                a.setDescription(rs.getString("description"));
                a.setImageUrl(rs.getString("image_url"));
                String tags = rs.getString("tags");
                if (tags != null && !tags.isEmpty()) {
                    a.setTags(java.util.Arrays.stream(tags.split(",")).map(String::trim).filter(s->!s.isEmpty()).toList());
                } else {
                    a.setTags(java.util.List.of());
                }
                return a;
            }, missionId
        );
    }
}
