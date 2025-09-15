package com.example.artemis;

import com.example.artemis.dao.AssetDao;
import com.example.artemis.dao.AssetModelDao;
import com.example.artemis.model.Asset;
import com.example.artemis.model.AssetModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/asset-models")
public class AssetModelRestController {
    private final AssetModelDao modelDao;
    private final AssetDao assetDao;

    public AssetModelRestController(AssetModelDao modelDao, AssetDao assetDao) {
        this.modelDao = modelDao;
        this.assetDao = assetDao;
    }

    @GetMapping
    public List<AssetModel> listModels() { return modelDao.findAll(); }

    @PostMapping
    public AssetModel createModel(@RequestBody AssetModel model) {
        return modelDao.insert(model);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteModel(@PathVariable String id) {
        int rows = modelDao.delete(id);
        return rows > 0 ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/assets")
    public List<Asset> listAssetsForModel(@PathVariable String id) {
        return modelDao.assetsForModel(id);
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<?> assign(@PathVariable String id, @RequestBody Map<String, String> body) {
        String assetId = body.get("assetId");
        if (assetDao.findById(assetId) == null) return ResponseEntity.badRequest().body("Unknown asset");
        if (modelDao.findById(id) == null) return ResponseEntity.notFound().build();
        modelDao.assign(id, assetId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/assign/{assetId}")
    public ResponseEntity<?> unassign(@PathVariable String id, @PathVariable String assetId) {
        if (modelDao.findById(id) == null) return ResponseEntity.notFound().build();
        modelDao.unassign(id, assetId);
        return ResponseEntity.noContent().build();
    }

    // Map: assetId -> models[] (for efficient UI rendering)
    @GetMapping("/by-asset")
    public Map<String, List<AssetModel>> modelsByAsset() {
        return modelDao.modelsByAsset();
    }
}
