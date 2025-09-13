package com.example.artemis;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.ui.Model;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.artemis.dao.AssetDao;
import com.example.artemis.dao.RouteDao;
import com.example.artemis.dao.MissionDao;
import com.example.artemis.dao.DriveDataDao;
import com.example.artemis.model.Asset;
import com.example.artemis.model.Route;
import com.example.artemis.model.Mission;

@Controller
public class WebController {

    // Startseite -> Template (index.html)
    @GetMapping("/")
    public String index() {
        return "index"; // liefert die React-Startseite
    }

    @GetMapping("/data")
    public String dataPage() {
        return "data";
    }

    // Beispiel-API Endpoint -> JSON
    @ResponseBody
    @GetMapping("/api/data")
    public Map<String, String> getData() {
        Map<String, String> data = new HashMap<>();
        data.put("status", "ok");
        data.put("message", "Hello from Spring Boot!");
        return data;
    }

    // Neue Seite -> Template (chart.html)
    @GetMapping("/chart")
    public String chart(Model model) {
        model.addAttribute("title", "Chart Page");

        Map<String, Object> data = loadDbData();
        model.addAttribute("idx", data.get("idx"));
        model.addAttribute("series", data.get("series"));

        return "chart"; // sucht templates/chart.html
    }

    @GetMapping({"/trajectory", "/trajectory/"})
    public String trajectory() {
        return "trajectory";
    }

    @ResponseBody
    @GetMapping("/api/series")
    public Map<String, Object> series() {
        return loadDbData();
    }

    @ResponseBody
    @GetMapping("/api/drive_style")
    public List<Map<String, Object>> driveStyle() throws IOException {
        Path csvPath = Paths.get("Data Base", "fahrtanalyse_daten.csv");
        List<Double> accel = new ArrayList<>();
        List<Double> steering = new ArrayList<>();

        try (BufferedReader br = Files.newBufferedReader(csvPath)) {
            br.readLine(); // header
            String line;
            while ((line = br.readLine()) != null) {
                String[] p = line.split(",");
                if (p.length < 6) continue;
                accel.add(Double.parseDouble(p[4]));
                steering.add(Double.parseDouble(p[2]));
            }
        }

        double maxAcc = accel.stream().mapToDouble(v -> Math.abs(v)).max().orElse(1.0);
        double maxSteer = steering.stream().mapToDouble(v -> Math.abs(v)).max().orElse(1.0);

        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 0; i < accel.size(); i++) {
            double score = (Math.abs(accel.get(i)) / maxAcc + Math.abs(steering.get(i)) / maxSteer) / 2.0;
            String label;
            if (score < 0.33) label = "Defensiv";
            else if (score < 0.66) label = "Normal";
            else label = "Aggressiv";
            Map<String, Object> row = new HashMap<>();
            row.put("index", i);
            row.put("style", label);
            row.put("score", Math.round(score * 100.0) / 100.0);
            result.add(row);
        }

        return result;
    }

    @ResponseBody
    @GetMapping("/api/regression_pairs")
    public Map<String, Object> regressionPairs() throws IOException {
        Path jsonPath = Paths.get("Data Base", "fahrtanalyse_regression.json");
        ObjectMapper mapper = new ObjectMapper();
        try (BufferedReader br = Files.newBufferedReader(jsonPath)) {
            return mapper.readValue(br, Map.class);
        }
    }

    // --- New SQLite-backed endpoints ---

    /**
     * Returns all assets stored in the SQLite database.
     */
    @ResponseBody
    @GetMapping("/api/assets")
    public List<Asset> assets() {
        return new AssetDao().findAll();
    }

    @ResponseBody
    @GetMapping("/api/routes")
    public List<Route> routes() {
        return new RouteDao().findAll();
    }

    @ResponseBody
    @GetMapping("/api/missions")
    public List<Mission> missions() {
        return new MissionDao().findAll();
    }

    private Map<String, Object> loadDbData() {
        return new DriveDataDao().findAll();
    }
}
