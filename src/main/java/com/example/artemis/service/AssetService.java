package com.example.artemis.service;

import com.example.artemis.dao.AssetDao;
import com.example.artemis.model.Asset;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssetService {
    private final AssetDao dao;

    public AssetService(AssetDao dao) {
        this.dao = dao;
    }

    public List<Asset> list() {
        return dao.findAll();
    }

    public Asset get(String id) {
        return dao.findById(id);
    }

    public Asset add(Asset asset) {
        return dao.insert(asset);
    }

    public void delete(String id) {
        dao.delete(id);
    }
}
