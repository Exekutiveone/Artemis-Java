package com.example.artemis;

import com.example.artemis.dao.AssetDao;
import com.example.artemis.dao.AssetLogDao;
import com.example.artemis.dao.MissionDao;
import com.example.artemis.model.Asset;
import com.example.artemis.model.Mission;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/missions")
public class MissionRestController {
    private final MissionDao missionDao;
    private final AssetDao assetDao;
    private final AssetLogDao logDao;

    public MissionRestController(MissionDao missionDao, AssetDao assetDao, AssetLogDao logDao) { this.missionDao = missionDao; this.assetDao = assetDao; this.logDao = logDao; }

    @GetMapping
    public List<Mission> list() { return missionDao.findAll(); }

    @PostMapping
    public Mission create(@RequestBody Mission m) { return missionDao.insert(m); }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        return missionDao.delete(id) > 0 ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    // Mission-centric asset listing and assignment
    @GetMapping("/{id}/assets")
    public ResponseEntity<?> assets(@PathVariable String id) {
        if (missionDao.findById(id) == null) return ResponseEntity.notFound().build();
        List<Asset> list = missionDao.assetsForMission(id);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<?> assign(@PathVariable String id, @RequestBody Map<String,String> body) {
        if (missionDao.findById(id) == null) return ResponseEntity.notFound().build();
        String assetId = body.get("assetId");
        if (assetDao.findById(assetId) == null) return ResponseEntity.badRequest().body("Unknown asset");
        missionDao.assign(id, assetId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/assign/{assetId}")
    public ResponseEntity<?> unassign(@PathVariable String id, @PathVariable String assetId) {
        if (missionDao.findById(id) == null) return ResponseEntity.notFound().build();
        missionDao.unassign(id, assetId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/logs")
    public ResponseEntity<?> deleteLogs(@PathVariable String id, @RequestParam(value = "assetId", required = false) String assetId) {
        if (missionDao.findById(id) == null) return ResponseEntity.notFound().build();
        int rows = (assetId != null) ? logDao.deleteByMissionAndAsset(id, assetId) : logDao.deleteByMission(id);
        return ResponseEntity.ok(Map.of("deleted", rows));
    }
}
