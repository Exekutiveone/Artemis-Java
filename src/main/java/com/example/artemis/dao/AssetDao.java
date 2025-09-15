package com.example.artemis.dao;

import com.example.artemis.model.Asset;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public class AssetDao {
    private final JdbcTemplate jdbc;
    private final RowMapper<Asset> mapper = (rs, rowNum) -> {
        Asset a = new Asset();
        a.setId(rs.getString("id"));
        a.setName(rs.getString("name"));
        a.setCategory(rs.getString("category"));
        a.setStatus(rs.getString("status"));
        a.setDescription(rs.getString("description"));
        a.setImageUrl(rs.getString("image_url"));
        String tags = rs.getString("tags");
        if (tags != null && !tags.isEmpty()) {
            a.setTags(java.util.Arrays.stream(tags.split(","))
                    .map(String::trim).filter(s -> !s.isEmpty()).toList());
        } else {
            a.setTags(java.util.List.of());
        }
        return a;
    };

    public AssetDao(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public List<Asset> findAll() {
        return jdbc.query("SELECT * FROM assets ORDER BY name", mapper);
    }

    public Asset findById(String id) {
        try {
            return jdbc.queryForObject("SELECT * FROM assets WHERE id = ?", mapper, id);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public Asset insert(Asset asset) {
        if (asset.getId() == null || asset.getId().isEmpty()) {
            asset.setId(UUID.randomUUID().toString());
        }
        String tags = asset.getTags() == null ? "" : String.join(",", asset.getTags());
        jdbc.update(
            "INSERT INTO assets (id, name, category, status, description, image_url, tags) VALUES (?,?,?,?,?,?,?)",
            asset.getId(), asset.getName(), asset.getCategory(), asset.getStatus(), asset.getDescription(), asset.getImageUrl(), tags
        );
        return asset;
    }

    public int delete(String id) {
        return jdbc.update("DELETE FROM assets WHERE id=?", id);
    }
}
