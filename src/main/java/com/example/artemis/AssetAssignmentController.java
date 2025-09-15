package com.example.artemis;

import com.example.artemis.dao.AssetDao;
import com.example.artemis.dao.AssetLogDao;
import com.example.artemis.dao.MissionDao;
import com.example.artemis.model.Mission;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/assets/{assetId}")
public class AssetAssignmentController {
    private final MissionDao missionDao;
    private final AssetDao assetDao;
    private final AssetLogDao logDao;

    public AssetAssignmentController(MissionDao missionDao, AssetDao assetDao, AssetLogDao logDao) {
        this.missionDao = missionDao; this.assetDao = assetDao; this.logDao = logDao;
    }

    @GetMapping("/missions")
    public ResponseEntity<?> missions(@PathVariable String assetId) {
        if (assetDao.findById(assetId) == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(missionDao.missionsForAsset(assetId));
    }

    @PostMapping("/missions")
    public ResponseEntity<?> assign(@PathVariable String assetId, @RequestBody Map<String,String> body) {
        if (assetDao.findById(assetId) == null) return ResponseEntity.notFound().build();
        String missionId = body.get("missionId");
        Mission m = missionDao.findById(missionId);
        if (m == null) return ResponseEntity.badRequest().body("Unknown mission");
        missionDao.assign(missionId, assetId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/missions/{missionId}")
    public ResponseEntity<?> unassign(@PathVariable String assetId, @PathVariable String missionId) {
        if (assetDao.findById(assetId) == null) return ResponseEntity.notFound().build();
        missionDao.unassign(missionId, assetId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/logs/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadCsv(@PathVariable String assetId,
                                       @RequestParam(value="missionId", required=false) String missionId,
                                       @RequestParam("file") MultipartFile file) {
        if (assetDao.findById(assetId) == null) return ResponseEntity.notFound().build();
        if (missionId != null && missionDao.findById(missionId) == null) return ResponseEntity.badRequest().body("Unknown mission");
        int count = 0;
        int lineNo = 0;
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String header = br.readLine();
            lineNo++;
            if (header == null) return ResponseEntity.badRequest().body("Empty CSV");
            // Handle BOM and auto-detect delimiter , or ;
            if (!header.isEmpty() && header.charAt(0) == '\uFEFF') {
                header = header.substring(1);
            }
            String delimiter = header.contains(";") && !header.contains(",") ? ";" : ",";
            String[] cols = Arrays.stream(header.split(java.util.regex.Pattern.quote(delimiter))).map(String::trim).toArray(String[]::new);
            String line;
            while ((line = br.readLine()) != null) {
                lineNo++;
                if (line.isBlank()) continue;
                String[] vals = line.split(java.util.regex.Pattern.quote(delimiter));
                Map<String,String> row = new HashMap<>();
                for (int i=0; i<cols.length && i<vals.length; i++) {
                    row.put(cols[i], vals[i].trim());
                }
                logDao.insertRow(assetId, missionId, row);
                count++;
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("CSV parse error at line "+lineNo+": "+e.getMessage());
        }
        Map<String,Object> resp = new HashMap<>();
        resp.put("inserted", count);
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/logs")
    public ResponseEntity<?> deleteLogs(@PathVariable String assetId,
                                        @RequestParam(value="missionId", required=false) String missionId) {
        if (assetDao.findById(assetId) == null) return ResponseEntity.notFound().build();
        int rows = (missionId != null) ? logDao.deleteByMissionAndAsset(missionId, assetId) : logDao.deleteByAsset(assetId);
        return ResponseEntity.ok(Map.of("deleted", rows));
    }
}
