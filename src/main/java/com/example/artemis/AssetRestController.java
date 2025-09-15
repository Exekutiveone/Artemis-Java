package com.example.artemis;

import com.example.artemis.model.Asset;
import com.example.artemis.service.AssetService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/assets")
public class AssetRestController {
    private final AssetService service;

    public AssetRestController(AssetService service) {
        this.service = service;
    }

    @GetMapping
    public List<Asset> list() throws IOException {
        return service.list();
    }

    @GetMapping("/{id}")
    public Asset get(@PathVariable String id) throws IOException {
        return service.get(id);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public Asset add(@RequestBody Asset asset) throws IOException {
        return service.add(asset);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
