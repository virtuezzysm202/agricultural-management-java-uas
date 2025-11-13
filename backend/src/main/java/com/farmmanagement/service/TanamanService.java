package com.farmmanagement.service;

import java.util.List;

import com.farmmanagement.model.Tanaman;
import com.farmmanagement.repository.TanamanRepository;

public class TanamanService {
    private final TanamanRepository repo = new TanamanRepository();

    public List<Tanaman> getAllTanaman() {
        return repo.findAll();
    }

    public Tanaman getTanamanById(int id) {
        return repo.findById(id);
    }

    public boolean addTanaman(Tanaman t) {
        return repo.save(t);
    }

    public boolean updateTanaman(Tanaman t) {
        return repo.update(t);
    }

    public boolean deleteTanaman(int id) {
        return repo.delete(id);
    }
}
