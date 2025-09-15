package com.example.artemis;

import com.example.artemis.dao.AssetLogDao;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/logs")
public class LogRestController {
    private final AssetLogDao logDao;

    public LogRestController(AssetLogDao logDao) {
        this.logDao = logDao;
    }

    @GetMapping
    public List<Map<String, Object>> list(
            @RequestParam(value = "missionId", required = false) String missionId,
            @RequestParam(value = "assetId", required = false) String assetId,
            @RequestParam(value = "limit", required = false) Integer limit
    ) {
        return logDao.listLogs(missionId, assetId, limit);
    }
}

