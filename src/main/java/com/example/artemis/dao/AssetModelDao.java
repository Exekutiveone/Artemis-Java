package com.example.artemis.dao;

import com.example.artemis.model.Asset;
import com.example.artemis.model.AssetModel;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public class AssetModelDao {
    private final JdbcTemplate jdbc;

    public AssetModelDao(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public List<AssetModel> findAll() {
        return jdbc.query("SELECT * FROM asset_models ORDER BY name",
                (rs, i) -> {
                    AssetModel m = new AssetModel();
                    m.setId(rs.getString("id"));
                    m.setName(rs.getString("name"));
                    m.setDescription(rs.getString("description"));
                    return m;
                });
    }

    public AssetModel findById(String id) {
        try {
            return jdbc.queryForObject("SELECT * FROM asset_models WHERE id = ?",
                    (rs, i) -> {
                        AssetModel m = new AssetModel();
                        m.setId(rs.getString("id"));
                        m.setName(rs.getString("name"));
                        m.setDescription(rs.getString("description"));
                        return m;
                    }, id);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public AssetModel insert(AssetModel model) {
        if (model.getId() == null || model.getId().isEmpty()) {
            model.setId(UUID.randomUUID().toString());
        }
        jdbc.update("INSERT INTO asset_models (id,name,description) VALUES (?,?,?)",
                model.getId(), model.getName(), model.getDescription());
        return model;
    }

    public int delete(String id) {
        return jdbc.update("DELETE FROM asset_models WHERE id=?", id);
    }

    public List<Asset> assetsForModel(String modelId) {
        return jdbc.query(
                "SELECT a.* FROM assets a JOIN asset_model_assets ama ON a.id = ama.asset_id WHERE ama.model_id = ? ORDER BY a.name",
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
                }, modelId);
    }

    public void assign(String modelId, String assetId) {
        jdbc.update("INSERT OR IGNORE INTO asset_model_assets (model_id, asset_id) VALUES (?,?)", modelId, assetId);
    }

    public void unassign(String modelId, String assetId) {
        jdbc.update("DELETE FROM asset_model_assets WHERE model_id=? AND asset_id=?", modelId, assetId);
    }

    public java.util.Map<String, java.util.List<com.example.artemis.model.AssetModel>> modelsByAsset() {
        var map = new java.util.HashMap<String, java.util.List<com.example.artemis.model.AssetModel>>();
        jdbc.query(
            "SELECT ama.asset_id as asset_id, am.id as id, am.name as name, am.description as description " +
            "FROM asset_model_assets ama JOIN asset_models am ON ama.model_id = am.id",
            rs -> {
                String assetId = rs.getString("asset_id");
                com.example.artemis.model.AssetModel m = new com.example.artemis.model.AssetModel();
                m.setId(rs.getString("id"));
                m.setName(rs.getString("name"));
                m.setDescription(rs.getString("description"));
                map.computeIfAbsent(assetId, k -> new java.util.ArrayList<>()).add(m);
            }
        );
        return map;
    }
}
