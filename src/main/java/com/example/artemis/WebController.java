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

@Controller
public class WebController {

    // Startseite -> Template (index.html)
    @GetMapping("/")
    public String index() {
        return "index"; // liefert die React-Startseite
    }

    // Beispiel-API Endpoint -> JSON
    @ResponseBody
    @GetMapping("/api/data")
    public String getData() {
        return "{ \"status\": \"ok\", \"message\": \"Hello from Spring Boot!\" }";
    }

    // Neue Seite -> Template (chart.html)
    @GetMapping("/chart")
    public String chart(Model model) throws IOException {
        model.addAttribute("title", "Chart Page");

        Map<String, Object> data = loadCsvData();
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
    public Map<String, Object> series() throws IOException {
        return loadCsvData();
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

    private Map<String, Object> loadCsvData() throws IOException {
        Path csvPath = Paths.get("Data Base", "fahrtanalyse_daten.csv");

        List<Integer> idx = new ArrayList<>();
        List<Double> speed = new ArrayList<>();
        List<Double> rpm = new ArrayList<>();
        List<Double> steering = new ArrayList<>();
        List<Double> distance = new ArrayList<>();
        List<Double> accel = new ArrayList<>();
        List<Double> lateralAcc = new ArrayList<>();
        List<Double> battery = new ArrayList<>();
        List<Double> distanceFront = new ArrayList<>();
        List<String> event = new ArrayList<>();
        List<String> manoeuvre = new ArrayList<>();
        List<String> terrain = new ArrayList<>();
        List<String> weather = new ArrayList<>();
        List<Double> gpsLat = new ArrayList<>();
        List<Double> gpsLon = new ArrayList<>();

        try (BufferedReader br = Files.newBufferedReader(csvPath)) {
            String line = br.readLine(); // header
            int i = 0;
            while ((line = br.readLine()) != null) {
                String[] p = line.split(",");
                if (p.length < 14) continue;
                speed.add(Double.parseDouble(p[0]));
                rpm.add(Double.parseDouble(p[1]));
                steering.add(Double.parseDouble(p[2]));
                distance.add(Double.parseDouble(p[3]));
                accel.add(Double.parseDouble(p[4]));
                lateralAcc.add(Double.parseDouble(p[5]));
                battery.add(Double.parseDouble(p[6]));
                distanceFront.add(Double.parseDouble(p[7]));
                event.add(p[8]);
                manoeuvre.add(p[9]);
                terrain.add(p[10]);
                weather.add(p[11]);
                gpsLat.add(Double.parseDouble(p[12]));
                gpsLon.add(Double.parseDouble(p[13]));
                idx.add(i++);
            }
        }

        Map<String, Object> series = new HashMap<>();
        series.put("speed", speed);
        series.put("rpm", rpm);
        series.put("steering", steering);
        series.put("distance", distance);
        series.put("accel", accel);
        series.put("lateral_acc", lateralAcc);
        series.put("battery", battery);
        series.put("distance_front", distanceFront);
        series.put("event", event);
        series.put("manoeuvre", manoeuvre);
        series.put("terrain_type", terrain);
        series.put("weather_condition", weather);
        series.put("terrain", terrain);
        series.put("weather", weather);
        series.put("gps_lat", gpsLat);
        series.put("gps_lon", gpsLon);

        Map<String, Object> result = new HashMap<>();
        result.put("idx", idx);
        result.put("series", series);
        return result;
    }
}
