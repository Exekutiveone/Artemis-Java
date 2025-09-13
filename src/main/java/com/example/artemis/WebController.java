package com.example.artemis;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.ui.Model;

@Controller
public class WebController {

    // Startseite -> Template (index.html)
    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("title", "Artemis Java");
        return "index"; // sucht templates/index.html
    }

    // Beispiel-API Endpoint -> JSON
    @ResponseBody
    @GetMapping("/api/data")
    public String getData() {
        return "{ \"status\": \"ok\", \"message\": \"Hello from Spring Boot!\" }";
    }

    // Neue Seite -> Template (chart.html)
    @GetMapping("/chart")
    public String chart(Model model) {
        model.addAttribute("title", "Chart Page");
        return "chart"; // sucht templates/chart.html
    }
}
